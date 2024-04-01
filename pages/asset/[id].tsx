import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { updateDoc, addDoc, getDoc, DocumentData, collection, doc, DocumentSnapshot } from "@firebase/firestore";
import { firestore } from "../../util/firebase-client";
import { FireDreamContainer, AssetForm } from "../../components";
import { Asset, Config, Wallet } from '../../types';
import Head from "next/head";
import { getServerSidePropsWithAuth, ServerProps } from "../../util/get-server-side-props-with-auth";
import Swal from 'sweetalert2';


export const getServerSideProps = getServerSidePropsWithAuth;


const AssetPage = (props: ServerProps) => {
  const configRef = doc(firestore, 'config/' + props.authUserId);
  const router = useRouter();
  const { id, wallet } = router.query;
  const assetRef = doc(firestore, 'assets/' + id);
  const walletRef = doc(firestore, 'wallets/' + wallet);
  const [asset, setAsset] = useState<DocumentSnapshot<DocumentData> | null>(null);
  const [config, setConfig] = useState<Config>();

  const breadcrumbItems = [
    { url: "/wallet/" + wallet, label: "Wallet" }
  ]

  const getConfig = async () => {
    const result = await getDoc(configRef);
    const c = result.data() as Config;
    setConfig(c);
  };

  const getAsset = async () => {
    const result = await getDoc(assetRef);
    setAsset(result);
  };

  const saveAsset = async (value: Asset) => {
    if (id === 'new') {
      const docRef = await addDoc(collection(firestore, 'assets'), value);
      const walletSnapshot = await getDoc(walletRef);
      const wallet = walletSnapshot.data() as Wallet;
      wallet.assets = {
        ...wallet.assets,
        [docRef.id]: docRef
      }
      await updateDoc(walletRef, wallet);
    } else {
      await updateDoc(assetRef, value);
    }
    router.replace('/wallet/' + wallet);
    Swal.fire(
      'Good job!',
      'Asset saved successfully!',
      'success'
    );
  }

  useEffect(() => {
    getConfig();
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
      <FireDreamContainer breadcrumbItems={breadcrumbItems}>
        <AssetForm isNewAsset={id=='new'} asset={asset?.data() as Asset} config={config} onSubmit={saveAsset} />
      </FireDreamContainer>
    </>
  )
}

export default AssetPage;