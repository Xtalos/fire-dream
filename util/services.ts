import axios from 'axios';
import { Asset, AssetValue, Wallet } from '../types';
import { writeBatch, doc, collection, getDoc, DocumentData, getDocsFromCache, getDocsFromServer, orderBy, query, QueryDocumentSnapshot, where, getDocs, updateDoc, setDoc } from 'firebase/firestore';
import { firestore } from './firebase-client';
import { formatValue, getAssetsValues } from './helpers';
import moment from 'moment';
import AssetValueCache from '../types/asset-value-cache';


export const updateQuotes = async (assets: Asset[]) => {
    const batch = writeBatch(firestore);
    const response = await axios.post('/api/quote', { assets });
    const assetValuesCollection = collection(firestore, 'assetsValues');

    const quotes = response.status === 200 ? response.data.values as AssetValue[] : [];
    quotes.filter(quote => quote.value).forEach(quote => {
        const assetValueRef = doc(assetValuesCollection);
        const assetRef = doc(firestore, 'assets/' + quote.assetId);
        batch.set(assetValueRef, quote);
        batch.update(assetRef, { lastValue: quote.value });
    });
    await batch.commit();
    const assetPromises = assets.map(asset => getDoc(doc(firestore, 'assets/' + asset.id)).then(assetResult => ({ ...assetResult.data(), id: asset.id } as Asset)));

    return await Promise.all(assetPromises);
}

export const updateWalletsQuotes = async (wallets: Wallet[]) => {
    const batch = writeBatch(firestore);
    const feedBatch = (wallet: Wallet) => {
        const results = Object.values(wallet.assets).map(assetRef => {
            return getDoc(assetRef).then(assetResult => ({ ...assetResult.data(), id: assetRef.id } as Asset));
        });
        return Promise.all(results)
            .then(updateQuotes)
            .then(assets => {
                const assetsValues = getAssetsValues(assets);
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

export const getOrUpdateCachedValues = async (owner:string,assets:Asset[],months:number,forceUpdate=false) => {
    let cachedValues = await getCachedValues(owner);
    if(forceUpdate || !cachedValues || moment(cachedValues.createdOn,'X').isBefore(moment(),'day')) {
        cachedValues = {
            owner,
            createdOn: parseInt(moment().format('X')),
            cache: convertResultToFirestore(await calculateTimeSeriesValues(assets,months))
        };
        const cachedValuesRef = doc(firestore, 'cachedValues/' + owner);
        await setDoc(cachedValuesRef, cachedValues);
    }
    return convertResultFromFirestore(cachedValues.cache);
}

const convertResultToFirestore = (cache:any) => {
    return {
        timeAssetValues:convertNestedArrayToObject(cache.timeAssetValues),
        timeCategoryValues:convertNestedArrayToObject(cache.timeCategoryValues),
        timeTotalValues:convertNestedArrayToObject(cache.timeTotalValues)
    }
}

const convertNestedArrayToObject = (nestedArray:any[][]) => {
    return nestedArray.reduce((acc:{},array:any[],index:number) => {
        return {
            ...acc,
            [index]:array
        }
    },{});
}

const convertResultFromFirestore = (cache:any) => {
    return {
        timeAssetValues:Object.values(cache.timeAssetValues),
        timeCategoryValues:Object.values(cache.timeCategoryValues),
        timeTotalValues:Object.values(cache.timeTotalValues)
    }
}

const getCachedValues = async (owner:string) => {
    const cachedValuesRef = doc(firestore, 'cachedValues/' + owner);
    const cachedValues = (await getDoc(cachedValuesRef))?.data() as AssetValueCache;
    return cachedValues;
}

const getTimesAxe = (months:number) => {
    const past = moment().subtract(months, 'months');
    const ta = ['x'];
    while (moment().isAfter(past,'day')) {
      ta.push(past.format('YYYY-MM-DD'));
      past.add(7, 'days');
    }
    ta.push(moment().format('YYYY-MM-DD'));
    return ta;
  }

  const calculateTimeSeriesValues = async (assets: Asset[], months:number) => {
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
    const timeAxe = getTimesAxe(months);
    const timeAssetValues = assets.reduce((acc: any[], asset: Asset) => {
      const alreadyExists = acc.find(a => a[0] === asset.name);
      return alreadyExists !== undefined ? acc : [...acc, [asset.name]]
    }, [timeAxe]);

    const timeCategoryValues = assets.reduce((acc: any[], asset: Asset) => {
      const alreadyExists = acc.find(a => a[0] === asset.category);
      return alreadyExists !== undefined ? acc : [...acc, [asset.category]]
    }, [timeAxe]);

    const timeTotalValues:any[] = [timeAxe, ['total']];

    timeAxe.slice(1).forEach((t, i) => {
      const singleDateValue = calculateSingleDateValues(t, assets, assetValues);
      timeTotalValues[1].push(parseFloat(formatValue(singleDateValue.get('total').value)));
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
      avMap.set(av.assetId, [...(avMap.has(av.assetId) ? avMap.get(av.assetId) : []), av]);
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
  const calculateSingleDateValues = (date: string, assets: Asset[], assetValues: AssetValue[]) => {
    const avMap = splitIntoSingleAssetValues(assetValues);
    const modAssets = assets.map(asset => {
      const av = avMap.get(asset.id)?.filter((av: AssetValue) => parseInt('' + av.createdOn) < parseInt(moment(date+' 23:59:59', 'YYYY-MM-DD HH:mm:ss').format('X'))).pop();
      return {
        ...asset,
        lastQuantity: av?.quantity || 0,
        lastValue: av?.value || 0
      }
    });

    return getAssetsValues(modAssets);
  }