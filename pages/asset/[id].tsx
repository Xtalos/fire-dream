import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { updateDoc, addDoc, getDoc, DocumentData, collection, doc, DocumentSnapshot } from "@firebase/firestore";
import { firestore } from "../../util/firebase-client";
import { FireDreamContainer, AssetForm } from "../../components";
import { Asset, Wallet } from '../../types';
import Head from "next/head";
import { getServerSidePropsWithAuth, ServerProps } from "../../util/get-server-side-props-with-auth";

export const getServerSideProps = getServerSidePropsWithAuth;


const AssetPage = (props: ServerProps) => {
  const router = useRouter();
  const { id, wallet } = router.query;
  const assetRef = doc(firestore, 'assets/' + id);
  const walletRef = doc(firestore, 'wallets/' + wallet);
  const [asset, setAsset] = useState<DocumentSnapshot<DocumentData> | null>(null);
  console.log('wallet', wallet);

  const getAsset = async () => {
    // construct a query to get up to 10 undone todos 
    // get the todos
    const result = await getDoc(assetRef);

    // map through todos adding them to an array

    // set it to state
    console.log(result);
    setAsset(result);
  };

  const saveAsset = async (value: Asset) => {
    if (id === 'new') {
      const docRef = await addDoc(collection(firestore, 'assets'), value);
      const walletSnapshot = await getDoc(walletRef);
      const wallet = walletSnapshot.data() as Wallet;
      wallet.assets = {
        ...wallet.assets,
        [value.name]: docRef
      }
      await updateDoc(walletRef, wallet);
      window.location.replace('/asset/' + docRef.id);
    } else {
      const result = await updateDoc(assetRef, value);
    }
  }

  useEffect(() => {
    switch (id) {
      case undefined: return void 0;
      case 'new':
        break;
      default:
        getAsset();
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
        <AssetForm asset={asset?.data() as Asset} onSubmit={saveAsset} />
      </FireDreamContainer>
    </>
  )
}

export default AssetPage;