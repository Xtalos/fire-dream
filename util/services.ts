import axios from 'axios';
import { Asset, AssetValue, Config, Wallet } from '../types';
import { writeBatch, doc, collection, getDoc, DocumentData, getDocsFromServer, orderBy, query, QueryDocumentSnapshot, where, setDoc, deleteDoc, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { firestore } from './firebase-client';
import { formatValue, getCalculatedValues } from './helpers';
import moment from 'moment';
import AssetValueCache from '../types/asset-value-cache';


export const updateQuotes = async (assets: Asset[], config?: Config) => {
  const batch = writeBatch(firestore);
  const response = await axios.post((`${process.env.VERCEL_URL ?? 'http://localhost:3000'}`) + '/api/yahoofinance-parser-quote', { assets, config });
  const assetValuesCollection = collection(firestore, 'assetsValues');

  const quotes = response.status === 200 ? response.data.values as AssetValue[] : [];
  quotes.filter(quote => quote.quantity && quote.value !== undefined).forEach(quote => {
    const assetValueRef = doc(assetValuesCollection);
    const assetRef = doc(firestore, 'assets/' + quote.assetId);
    batch.set(assetValueRef, quote);
    batch.update(assetRef, { lastValue: quote.value });
  });
  await batch.commit();
  const assetPromises = assets.map(asset => getDoc(doc(firestore, 'assets/' + asset.id)).then(assetResult => ({ ...assetResult.data(), id: asset.id } as Asset)));

  return await Promise.all(assetPromises);
}

export const updateWalletsQuotes = async (wallets: Wallet[], config?: Config) => {
  const batch = writeBatch(firestore);
  const feedBatch = (wallet: Wallet) => {
    const results = Object.values(wallet.assets).map(assetRef => {
      return getDoc(assetRef).then(assetResult => ({ ...assetResult.data(), id: assetRef.id } as Asset));
    });
    return Promise.all(results)
      .then(assets => updateQuotes(assets, config))
      .then(assets => {
        const assetsValues = getCalculatedValues(assets);
        const walletRef = doc(firestore, 'wallets/' + wallet.id);
        const updateWallet = {
          invested: assetsValues.get('total').invested,
          lastValue: assetsValues.get('total').value,
          risk: assetsValues.get('total').globalRisk
        };
        batch.update(walletRef, updateWallet);
        return {
          ...wallet,
          ...updateWallet
        }
      });
  }
  const batchPromises = wallets.filter(wallet => wallet.assets).map(feedBatch);
  const updatedWallets = await Promise.all(batchPromises);
  await batch.commit();

  return updatedWallets;
}

export const updateAssetValuesTimes = async (assetValues: AssetValue[]) => {
  const batch = writeBatch(firestore);
  assetValues.forEach(av => {
    const assetValueRef = doc(firestore, 'assetsValues/' + av.id);
    batch.update(assetValueRef, { createdOn: av.createdOn });
  });
  await batch.commit();
  return 0;
}

export const getOrUpdateCachedValues = async (owner: string, assets: Asset[], months: number, forceUpdate = false, normalize = false, benchmarkTax = 0) => {
  let cachedValues = forceUpdate ? null : await getCachedValues(owner);
  if (forceUpdate || !cachedValues) {
    cachedValues = {
      owner,
      createdOn: parseInt(moment().format('X')),
      cache: await getAssetsValues(assets, months)
    };
    const cachedValuesRef = doc(firestore, 'cachedValues/' + owner);
    await setDoc(cachedValuesRef, cachedValues);
  }
  const assetValues = filterAssetvalues(cachedValues.cache, assets);

  return await calculateTimeSeriesValues(assets, assetValues, months, normalize, benchmarkTax);
}

const filterAssetvalues = (assetValues: AssetValue[], filter: Asset[]) => {
  return assetValues.filter(av => undefined !== filter.find(a => a.id == av.assetId));
}

const getCachedValues = async (owner: string) => {
  const cachedValuesRef = doc(firestore, 'cachedValues/' + owner);
  const cachedValues = (await getDoc(cachedValuesRef))?.data() as AssetValueCache;
  return cachedValues;
}

const getTimesAxe = (months: number) => {
  const past = moment().subtract(months, 'months');
  const ta = ['x'];
  while (moment().isAfter(past, 'day')) {
    ta.push(past.format('YYYY-MM-DD'));
    past.add(7, 'days');
  }
  ta.push(moment().format('YYYY-MM-DD'));
  return ta;
}

const getAssetsValues = async (assets: Asset[], months: number) => {
  const assetValueCollection = collection(firestore, 'assetsValues');
  const sixMonthAgo = moment().subtract(months, 'months');
  const assetIds = assets.map(a => a.id);
  const result: QueryDocumentSnapshot<DocumentData>[] = [];
  const resultPromise = assetIds.map(assetId => {
    const assetValueQuery = query(assetValueCollection,
      where('assetId', '==', assetId),
      where('createdOn', '>=', parseInt(sixMonthAgo.format('X'))),
      orderBy("createdOn"));
    return getDocsFromServer(assetValueQuery).then(querySnapshot => querySnapshot.forEach((snapshot) => {
      result.push(snapshot);
    }));
  });
  await Promise.all(resultPromise);
  const assetValues = result.map(r => ({ ...r.data(), id: r.id }) as AssetValue);

  return assetValues;
}

const calculateTimeSeriesValues = async (assets: Asset[], assetValues: AssetValue[], months: number, normalize = false, benchmarkTax = 0) => {
  const timeAxe = getTimesAxe(months);
  const firstAssetsDate = moment(assetValues[0]?.createdOn,'X').format('YYYY-MM-DD');
  timeAxe[1] = timeAxe[1] != firstAssetsDate ? firstAssetsDate : timeAxe[1];
  const timeAssetValues = assets.reduce((acc: any[], asset: Asset) => {
    const alreadyExists = acc.find(a => a[0] === asset.name);
    return alreadyExists !== undefined ? acc : [...acc, [asset.name]]
  }, [timeAxe]);

  const timeCategoryValues = assets.reduce((acc: any[], asset: Asset) => {
    const alreadyExists = acc.find(a => a[0] === asset.category);
    return alreadyExists !== undefined ? acc : [...acc, [asset.category]]
  }, [timeAxe]);

  const timeTotalValues: any[] = [timeAxe, ['total'], ['invested'], ['benchmark']];
  const avMap = splitIntoSingleAssetValues(assetValues);
  let startingInvested: number, valueRevalued: number;
  let startingDate = timeAxe[1];
  timeAxe.slice(1).forEach((t, i) => {
    const singleDateValue = calculateSingleDateValues(t, assets, avMap, normalize);
    const timeTotalValue = parseFloat(formatValue(singleDateValue.get('total').value));
    const timeTotalInvested = parseFloat(formatValue(singleDateValue.get('total').invested));
    timeTotalValues[1].push(timeTotalValue);
    timeTotalValues[2].push(timeTotalInvested);
    const daySinceStart = moment(t).diff(startingDate, 'days');
    startingDate = t;
    const revaluationFactor = Math.pow(1 + benchmarkTax / 100, daySinceStart / 365);//calculate composite interests since the previous time
    if (i === 0) {
      valueRevalued = (timeTotalValue > timeTotalInvested ? timeTotalValue : timeTotalInvested);
      startingInvested = timeTotalInvested;
    }
    const deltaInvested = timeTotalInvested - startingInvested;
    startingInvested = timeTotalInvested;
    valueRevalued = valueRevalued * revaluationFactor + deltaInvested;//store the value revaluated for intest rate + delta invested
    timeTotalValues[3].push(parseFloat(formatValue(valueRevalued)));

    assets.forEach(asset => {
      let categoryIdx = timeCategoryValues.findIndex(tav => tav[0] === asset.category);
      if (timeCategoryValues[categoryIdx].length === (i + 1)) {
        timeCategoryValues[categoryIdx].push(parseFloat(formatValue(singleDateValue.get(asset.id).value)));
      } else {
        timeCategoryValues[categoryIdx][i + 1] = parseFloat(formatValue(timeCategoryValues[categoryIdx][i + 1] + singleDateValue.get(asset.id).value));
      }
      const idx = timeAssetValues.findIndex(tav => tav[0] === asset.name);
      if (timeAssetValues[idx].length === (i + 1)) {
        timeAssetValues[idx].push(parseFloat(formatValue(singleDateValue.get(asset.id).value)));
      } else {
        timeAssetValues[idx][i + 1] = parseFloat(formatValue(timeAssetValues[idx][i + 1] + singleDateValue.get(asset.id).value));
      }
    });
  });

  return { timeAssetValues, timeCategoryValues, timeTotalValues };
}

/**
 * Generate a Map of the downloaded assetValues documents
 *
 * @param {AssetValue[]} assetValues
 * @returns
 */
const splitIntoSingleAssetValues = (assetValues: AssetValue[]) => {
  const avMap = new Map();
  assetValues.forEach(av => {
    avMap.set(av.assetId, [...(avMap.has(av.assetId) ? avMap.get(av.assetId).filter((a: AssetValue) => a.value && a.quantity) : []), av]);
  })
  return avMap;
}

/**
 * Calculate the asset values for a single date using the conversion factor.
 *
 * @param {string} date
 * @param {Asset[]} assets
 * @param {AssetValue[]} assetValues
 * @returns
 */
const calculateSingleDateValues = (date: string, assets: Asset[], avMap: Map<string, AssetValue[]>, normalize: boolean) => {
  const modAssets = assets.map(asset => {
    const av = avMap.get(asset.id)?.filter((av: AssetValue) => parseInt('' + av.createdOn) < parseInt(moment(date + ' 23:59:59', 'YYYY-MM-DD HH:mm:ss').format('X'))).pop();
    return {
      ...asset,
      lastQuantity: av?.quantity || 0,
      lastInvested: av?.invested || 0,
      lastValue: av?.value || 0
    }
  });

  //console.log(modAssets);
  return getCalculatedValues(modAssets, normalize);
}

export const getAssetsValuesByPeriod = async (assets: Asset[], start: string, end: string) => {
  const startDate = moment(start, 'YYYY-MM-DD');
  const endDate = moment(end, 'YYYY-MM-DD');
  if (!startDate.isValid() || !endDate.isValid()) {
    return [];
  }
  const assetValueCollection = collection(firestore, 'assetsValues');
  const startDateTimestamp = parseInt(startDate.format('X'));
  const endDateTimestamp = parseInt(endDate.format('X'));
  const assetIds = assets.map(a => a.id);
  const result: QueryDocumentSnapshot<DocumentData>[] = [];
  const resultPromise = assetIds.map(assetId => {
    const assetValueQuery = query(assetValueCollection,
      where('assetId', '==', assetId),
      where('createdOn', '>=', startDateTimestamp),
      where('createdOn', '<=', endDateTimestamp),
      orderBy("createdOn"));
    return getDocsFromServer(assetValueQuery).then(querySnapshot => querySnapshot.forEach((snapshot) => {
      result.push(snapshot);
    }));
  });
  await Promise.all(resultPromise);
  const assetValues = result.map(r => ({ ...r.data(), id: r.id }) as AssetValue);

  return assetValues;
}

export const deleteFromDB = async (resourceName: string, id: string) => {
  return await deleteDoc(doc(firestore, resourceName, id));
}

export const saveOnDB = async (resourceName: string, resource: any) => {
  const resourceRef = doc(firestore, resourceName + (resource.id ? '/' + resource.id : ''));
  return await setDoc(resourceRef, resource);
}

export const createNewAssetValue = async (av: AssetValue) => {
  const valueRef = await addDoc(collection(firestore, 'assetsValues'), av);
  const assetRef = doc(firestore, 'assets/' + av.assetId);
  await updateDoc(assetRef, {
    lastQuantity: av.quantity,
    lastValue: av.value,
    lastInvested: av.invested
  });
}

export const getWalletsAndAssets = async (authUserId: string) => {
  const walletsCollection = collection(firestore, 'wallets');
  const walletsQuery = query(walletsCollection, where('owner', '==', authUserId),where('active', '==', true));
  const querySnapshot = await getDocs(walletsQuery);
  const result: QueryDocumentSnapshot<DocumentData>[] = [];
  querySnapshot.forEach((snapshot: any) => {
    result.push(snapshot);
  });

  const wallets = result.map(item => ({ ...item.data(), id: item.id } as Wallet));
  const asstPromises = wallets.filter(wallet => wallet.assets).reduce((acc: Promise<Asset>[], wallet: Wallet): Promise<Asset>[] => {
    const results = Object.values(wallet.assets).map(async assetRef => {
      return getDoc(assetRef).then(assetResult => ({ ...assetResult.data(), id: assetRef.id, targetRatio: assetResult.data()?.targetRatio * wallet.targetRatio } as Asset));
    });
    return [...acc, ...results]
  }, []);
  const assets = await Promise.all(asstPromises);

  return { wallets, assets };
};


export const getUpdateQuotesUrl = async (uid: string) => {
  const response = await axios.get('/api/get-update-quotes-url?uid='+uid);

  return response?.data?.url;
}