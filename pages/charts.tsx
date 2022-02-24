import Head from 'next/head';
import { FireDreamContainer } from '../components';
import styles from '../styles/Home.module.css'
import { firestore } from '../util/firebase-client';
import { collection, QueryDocumentSnapshot, DocumentData, query, where, getDocs, getDoc } from "@firebase/firestore";
import { useEffect, useState } from 'react';
import { Asset, Wallet } from '../types';
import { getServerSidePropsWithAuth, ServerProps } from '../util/get-server-side-props-with-auth';
import { useRouter } from 'next/router';
import ChartsPanel from '../components/charts-panel';

const walletsCollection = collection(firestore, 'wallets');

export const getServerSideProps = getServerSidePropsWithAuth;

const Charts = (props: ServerProps) => {
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  const getWallets = async () => {
    const walletsQuery = query(walletsCollection, where('owner', '==', props.authUserId));
    const querySnapshot = await getDocs(walletsQuery);
    const result: QueryDocumentSnapshot<DocumentData>[] = [];
    querySnapshot.forEach((snapshot) => {
      result.push(snapshot);
    });

    const w = result.map(item => ({ ...item.data(), id: item.id } as Wallet));
    const asstPromises =  w.filter(wallet => wallet.assets).reduce((acc:Promise<Asset>[],wallet:Wallet):Promise<Asset>[] => {
      const results = Object.values(wallet.assets).map(async assetRef => {
        return getDoc(assetRef).then(assetResult => ({ ...assetResult.data(), id: assetRef.id } as Asset));
      });
      return [...acc,...results]
    },[]);
    const a = await Promise.all(asstPromises);

    setAssets(a);
    setWallets(w);
  };

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
        <ChartsPanel wallets={wallets} assets={assets}/>
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