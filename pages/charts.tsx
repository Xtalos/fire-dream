import Head from 'next/head';
import { FireDreamContainer } from '../components';
import styles from '../styles/Home.module.css'
import { firestore } from '../util/firebase-client';
import { collection, QueryDocumentSnapshot, DocumentData, query, where, getDocs, getDoc, Firestore, getFirestore, Timestamp } from "@firebase/firestore";
import { useEffect, useState } from 'react';
import { Asset, AssetValue, Wallet } from '../types';
import { getServerSidePropsWithAuth, ServerProps } from '../util/get-server-side-props-with-auth';
import { useRouter } from 'next/router';
import ChartsPanel from '../components/charts-panel';
import moment from 'moment';
import { orderBy } from 'firebase/firestore';
import { getAssetsValues } from '../util/helpers';
import { updateAssetValuesTimes } from '../util/services';

const MONTHS = 6;
const walletsCollection = collection(firestore, 'wallets');
const assetValueCollection = collection(firestore, 'assetsValues');

export const getServerSideProps = getServerSidePropsWithAuth;

const Charts = (props: ServerProps) => {
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [timeAxe, setTimeAxe] = useState<any[]>([]);
  const [timeValues, setTimeValues] = useState<any[]>([]);

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
    const tv = await calculateTimeSeriesValues(a);
    setTimeValues(checkTimeValuesConsistence(tv) ? tv : []);
  };

  const checkTimeValuesConsistence = (tv:any[]) => {
    let safe = true;
    let len = tv[0].length;
    tv.forEach(t => {
      if(t.length !== len){
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
    setTimeAxe([...ta])
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
      return getDocs(assetValueQuery).then(querySnapshot => querySnapshot.forEach((snapshot) => {
        result.push(snapshot);
      }));
    });
    await Promise.all(resultPromise);
    const assetValues = result.map(r => ({...r.data(),id:r.id}) as AssetValue);
    getTimesAxe();
    const timeAssetValues = assets.reduce((acc:any[],asset:Asset)=>{
      const alreadyExists = acc.find(a => a[0] === asset.name);
      return alreadyExists !== undefined ? acc : [...acc,[asset.name]]
    },[timeAxe]);
    timeAxe.slice(1).forEach((t,i) => {
      const singleDateValue = calculateSingleDateValues(t,assets,assetValues);
      assets.forEach(asset => {
        const idx = timeAssetValues.findIndex(tav => tav[0] === asset.name);
        if(timeAssetValues[idx].length === (i+1)) {
          timeAssetValues[idx].push(singleDateValue.get(asset.id).value);
        } else {
          timeAssetValues[idx][i+1] += singleDateValue.get(asset.id).value;
        }
      });
    });

    return timeAssetValues;
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
      const av = avMap.get(asset.id)?.filter((av:AssetValue) => parseInt(''+av.createdOn) < parseInt(moment(date, 'YYYY-MM-DD').format('X'))).pop();
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