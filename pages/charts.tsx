import Head from 'next/head';
import { FireDreamContainer } from '../components';
import styles from '../styles/Home.module.css'
import { firestore } from '../util/firebase-client';
import { collection, QueryDocumentSnapshot, DocumentData, query, where, getDocs, getDoc, getDocsFromCache, getDocsFromServer, QuerySnapshot } from "@firebase/firestore";
import { useEffect, useState } from 'react';
import { Asset, AssetValue, Wallet } from '../types';
import { getServerSidePropsWithAuth, ServerProps } from '../util/get-server-side-props-with-auth';
import ChartsPanel from '../components/charts-panel';
import moment from 'moment';
import { orderBy } from 'firebase/firestore';
import { getAssetsValues } from '../util/helpers';

const MONTHS = 6;
const walletsCollection = collection(firestore, 'wallets');
const assetValueCollection = collection(firestore, 'assetsValues');

export const getServerSideProps = getServerSidePropsWithAuth;

const Charts = (props: ServerProps) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [timeValues, setTimeValues] = useState<{ timeAssetValues: any[], timeCategoryValues: any[], timeTotalValues: any[] }>(
    { timeAssetValues: [], timeCategoryValues: [], timeTotalValues: [] }
  );

  const getWallets = async () => {
    const walletsQuery = query(walletsCollection, where('owner', '==', props.authUserId));
    const querySnapshot = await getDocs(walletsQuery);
    const result: QueryDocumentSnapshot<DocumentData>[] = [];
    querySnapshot.forEach((snapshot) => {
      result.push(snapshot);
    });

    const w = result.map(item => ({ ...item.data(), id: item.id } as Wallet));
    const asstPromises = w.filter(wallet => wallet.assets).reduce((acc: Promise<Asset>[], wallet: Wallet): Promise<Asset>[] => {
      const results = Object.values(wallet.assets).map(async assetRef => {
        return getDoc(assetRef).then(assetResult => ({ ...assetResult.data(), id: assetRef.id } as Asset));
      });
      return [...acc, ...results]
    }, []);
    const a = await Promise.all(asstPromises);

    setAssets(a);
    setWallets(w);
    let tv = await calculateTimeSeriesValues(a);
    tv = {
      timeAssetValues: checkTimeValuesConsistence(tv.timeAssetValues) ? tv.timeAssetValues : [],
      timeCategoryValues: checkTimeValuesConsistence(tv.timeCategoryValues) ? tv.timeCategoryValues : [],
      timeTotalValues: checkTimeValuesConsistence(tv.timeTotalValues) ? tv.timeTotalValues : []
    }
    setTimeValues(tv);
  };

  const checkTimeValuesConsistence = (tv: any[]) => {
    let safe = true;
    let len = tv[0].length;
    tv.forEach(t => {
      if (t.length !== len) {
        safe = false;
        return;
      }
    });

    return safe;
  }

  const getTimesAxe = () => {
    const past = moment().subtract(MONTHS, 'months');
    const ta = ['x'];
    while (moment().isSameOrAfter(past)) {
      ta.push(past.format('YYYY-MM-DD'));
      past.add(7, 'days');
    }
    return ta;
  }

  const calculateTimeSeriesValues = async (assets: Asset[]) => {
    const sixMonthAgo = moment().subtract(MONTHS, 'months');
    const assetIds = assets.map(a => a.id);
    const result: QueryDocumentSnapshot<DocumentData>[] = [];
    const resultPromise = assetIds.map(assetId => {
      const assetValueQuery = query(assetValueCollection,
        where('assetId', '==', assetId),
        where('createdOn', '>=', parseInt(sixMonthAgo.format('X'))),
        orderBy("createdOn"));
      return (getDocsFromCache(assetValueQuery)
        .then(qs => {
          console.log('from cache',qs.size);
          if(!qs.size) throw new Error('empty cache');
          return qs;
        })
        .catch(e => getDocsFromServer(assetValueQuery)))
        .then(querySnapshot => querySnapshot.forEach((snapshot) => {
          result.push(snapshot);
        }));
    });
    await Promise.all(resultPromise);
    const assetValues = result.map(r => ({ ...r.data(), id: r.id }) as AssetValue);
    const timeAxe = getTimesAxe();
    const timeAssetValues = assets.reduce((acc: any[], asset: Asset) => {
      const alreadyExists = acc.find(a => a[0] === asset.name);
      return alreadyExists !== undefined ? acc : [...acc, [asset.name]]
    }, [timeAxe]);

    const timeCategoryValues = assets.reduce((acc: any[], asset: Asset) => {
      const alreadyExists = acc.find(a => a[0] === asset.category);
      return alreadyExists !== undefined ? acc : [...acc, [asset.category]]
    }, [timeAxe]);

    const timeTotalValues = [timeAxe, ['total']];

    timeAxe.slice(1).forEach((t, i) => {
      const singleDateValue = calculateSingleDateValues(t, assets, assetValues);
      timeTotalValues[1].push(singleDateValue.get('total').value);
      assets.forEach(asset => {
        let categoryIdx = timeCategoryValues.findIndex(tav => tav[0] === asset.category);
        if (timeCategoryValues[categoryIdx].length === (i + 1)) {
          timeCategoryValues[categoryIdx].push(singleDateValue.get(asset.id).value);
        } else {
          timeCategoryValues[categoryIdx][i + 1] += singleDateValue.get(asset.id).value;
        }
        const idx = timeAssetValues.findIndex(tav => tav[0] === asset.name);
        if (timeAssetValues[idx].length === (i + 1)) {
          timeAssetValues[idx].push(singleDateValue.get(asset.id).value);
        } else {
          timeAssetValues[idx][i + 1] += singleDateValue.get(asset.id).value;
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
      const av = avMap.get(asset.id)?.filter((av: AssetValue) => parseInt('' + av.createdOn) < parseInt(moment(date, 'YYYY-MM-DD').format('X'))).pop();
      return {
        ...asset,
        lastQuantity: av?.quantity || 0,
        lastValue: av?.value || 0
      }
    });

    return getAssetsValues(modAssets);
  }

  useEffect(() => {
    getWallets();
  }, []);

  return (
    <>
      <Head>
        <title>{process.env.APP_NAME}</title>
        <meta name="charts" content="charts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <FireDreamContainer>
        <ChartsPanel wallets={wallets} assets={assets} timeValues={timeValues} />
      </FireDreamContainer>
      <footer className={styles.footer}>
        <a
          href="#"
          rel="noopener noreferrer"
        >
        </a>
      </footer>
    </>
  )
}
export default Charts;