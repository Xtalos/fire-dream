import type { NextPage } from 'next'
import Head from 'next/head';
import { AssetList, Container } from '../components';
import styles from '../styles/Home.module.css'

import { firestore } from '../firebase/webApp';

import { collection, QueryDocumentSnapshot, DocumentData, query, where, limit, getDocs } from "@firebase/firestore";


import { useEffect, useState } from 'react';
import { Asset, AssetValue } from '../types';
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
    <div>
      <Head>
        <title>Todos app</title>
        <meta name="description" content="Next.js firebase todos app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <AssetList assets={assets} onSubmit={(result:AssetValue) => console.log(result)}/>
      </Container>
      <footer className={styles.footer}>
        <a
          href="#"
          rel="noopener noreferrer"
        >
        </a>
      </footer>
    </div>
  )
}
export default Home