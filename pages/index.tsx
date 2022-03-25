import Head from 'next/head';
import { FireDreamContainer } from '../components';
import styles from '../styles/Home.module.css'
import { firestore } from '../util/firebase-client';
import { collection, QueryDocumentSnapshot, DocumentData, query, where, getDocs } from "@firebase/firestore";
import { useEffect, useState } from 'react';
import { Config, Wallet } from '../types';
import { getServerSidePropsWithAuth, ServerProps } from '../util/get-server-side-props-with-auth';
import WalletList from '../components/wallet-list';
import { updateWalletsQuotes } from '../util/services';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';


const walletsCollection = collection(firestore, 'wallets');

export const getServerSideProps = getServerSidePropsWithAuth;

const Home = (props: ServerProps) => {
  const router = useRouter();
  const configRef = doc(firestore, 'config/' + props.authUserId);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [config, setConfig] = useState<Config>();

  const getWallets = async () => {
    const walletsQuery = query(walletsCollection, where('owner', '==', props.authUserId));
    const querySnapshot = await getDocs(walletsQuery);
    const result: QueryDocumentSnapshot<DocumentData>[] = [];
    querySnapshot.forEach((snapshot) => {
      result.push(snapshot);
    });

    const w = result.map(item => ({ ...item.data(), id: item.id } as Wallet));
    setWallets(w);
  };

  const getConfig = async () => {
    const result = await getDoc(configRef);
    const c = result.data() as Config;
    setConfig(c);
  };

  useEffect(() => {
    // get the todos
    getWallets();
    getConfig();
    // reset loading
    // setTimeout(() => {
    //   setLoading(false);
    // }, 2000)
  }, []);

  const updateQuotes = async (wallts: Wallet[]) => {
    const updatedWallets = await updateWalletsQuotes(wallts,config);
    setWallets(updatedWallets);
    Swal.fire(
      'Good job!',
      'Assets quotes updated successfully!',
      'success'
    );
  }

  return (
    <>
      <Head>
        <title>{process.env.APP_NAME}</title>
        <meta name="description" content="Next.js firebase todos app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <FireDreamContainer>
        <WalletList wallets={wallets} updateQuotes={updateQuotes} />
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
export default Home