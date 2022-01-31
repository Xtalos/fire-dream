import type { NextPage } from 'next'
import Head from 'next/head';
import { AssetList, FireDreamContainer } from '../components';
import styles from '../styles/Home.module.css'

import { firestore } from '../firebase/webApp';

import { collection, QueryDocumentSnapshot, DocumentData, query, where, limit, getDocs, addDoc, updateDoc } from "@firebase/firestore";


import { useEffect, useState } from 'react';
import { Asset, AssetValue } from '../types';
import { doc } from 'firebase/firestore';
const usersCollection = collection(firestore, 'users');
const assetsCollection = collection(firestore, 'assets');



const Home: NextPage = () => {

  const [users, setUsers] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getUsers = async () => {
    // construct a query to get up to 10 undone todos 
    const usersQuery = query(usersCollection, where('active', '==', true), limit(10));
    // get the todos
    const querySnapshot = await getDocs(usersQuery);

    // map through todos adding them to an array
    const result: QueryDocumentSnapshot<DocumentData>[] = [];
    querySnapshot.forEach((snapshot) => {
      result.push(snapshot);
    });
    // set it to state
    console.log(result);
    setUsers(result);
  };

  const getAssets = async () => {
    // construct a query to get up to 10 undone todos 
    const assetsQuery = query(assetsCollection);
    // get the todos
    const querySnapshot = await getDocs(assetsQuery);

    // map through todos adding them to an array
    const result: QueryDocumentSnapshot<DocumentData>[] = [];
    querySnapshot.forEach((snapshot) => {
      result.push(snapshot);
    });
    // set it to state
    const assets = result.map(item => ({...item.data(),id:item.id} as Asset));
    console.log(assets);
    setAssets(assets);
  };

  const addValue = async (av:AssetValue) => {
    const valueRef = await addDoc(collection(firestore, 'assetsValues'), av);
    const assetRef = doc(firestore, 'assets/' + av.assetId);
    await updateDoc(assetRef, {
      lastQuantity:av.quantity,
      lastValue:av.value
    });
  }

  useEffect(() => {
    // get the todos
    getUsers();
    getAssets();
    // reset loading
    setTimeout(() => {
      setLoading(false);
    }, 2000)
  }, []);

  return (
    <>
      <Head>
        <title>{process.env.APP_NAME}</title>
        <meta name="description" content="Next.js firebase todos app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <FireDreamContainer>
        <AssetList assets={assets} onSubmit={addValue}/>
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