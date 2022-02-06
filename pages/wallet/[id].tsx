import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { updateDoc, addDoc, getDoc, collection, doc } from "@firebase/firestore";
import { firestore } from "../../util/firebase-client";
import { FireDreamContainer, AssetList } from "../../components";
import { Asset, AssetValue, Wallet } from '../../types';
import Head from "next/head";
import { getServerSidePropsWithAuth, ServerProps } from "../../util/get-server-side-props-with-auth";
import WalletForm from "../../components/wallet-form";

export const getServerSideProps = getServerSidePropsWithAuth;

const assetsCollection = collection(firestore, 'assets');


const WalletPage = (props: ServerProps) => {
  const router = useRouter();
  const { id, edit } = router.query;
  const walletRef = doc(firestore, 'wallets/' + id);
  const [wallet, setWallet] = useState<Wallet | undefined>();
  const [assets, setAssets] = useState<Asset[]>([]);

  const getWallet = async () => {
    // construct a query to get up to 10 undone todos 
    // get the todos
    const result = await getDoc(walletRef);

    // map through todos adding them to an array

    // set it to state
    const w = result.data() as Wallet;
    console.log(w);
    let asts:Asset[] = [];
    if(w.assets) {
      const results = Object.values(w.assets).map(async assetRef => {
        return getDoc(assetRef).then(assetResult => ({...assetResult.data(),id:assetRef.id} as Asset));
      });
      asts = await Promise.all(results);
    } 
    console.log('assets',asts);
    setAssets(asts);
    setWallet(w);
  };

  const saveWallet = async (value: Wallet) => {
    if (id === 'new') {
      value.owner = props.authUserId;
      const docRef = await addDoc(collection(firestore, 'wallets'), value);
      router.replace('/wallet/' + docRef.id);
    } else {
      const result = await updateDoc(walletRef, value);
      router.replace('/');
    }
  }

  const addValue = async (av:AssetValue) => {
    const valueRef = await addDoc(collection(firestore, 'assetsValues'), av);
    const assetRef = doc(firestore, 'assets/' + av.assetId);
    await updateDoc(assetRef, {
      lastQuantity:av.quantity,
      lastValue:av.value
    });
    router.reload();
  }

  useEffect(() => {
    switch (id) {
      case undefined: return void 0;
      case 'new':
        break;
      default:
        getWallet();
    }
  }, [id]);

  return (
    <>
      <Head>
        <title>{process.env.APP_NAME}</title>
        <meta name="description" content="Next.js firebase todos app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <FireDreamContainer>
        
        { id && id !== 'new' && !edit ? (
        <>
        <h1 className="text-center">{wallet?.label}</h1>
        <AssetList assets={assets} walletId={id as string} onSubmit={addValue}/>
        </>) : <></>}

        { id === 'new' || edit ? <WalletForm wallet={wallet} onSubmit={saveWallet}/> : <></>}
      </FireDreamContainer>
    </>
  )
}

export default WalletPage;