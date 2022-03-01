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
import { getOrUpdateCachedValues } from '../util/services';

const walletsCollection = collection(firestore, 'wallets');

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
    let tv = await getOrUpdateCachedValues(props.authUserId,a,6);
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