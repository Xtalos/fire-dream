import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { updateDoc, addDoc, getDoc, collection, doc } from "@firebase/firestore";
import { firestore } from "../../util/firebase-client";
import { FireDreamContainer, AssetList } from "../../components";
import { Asset, AssetValue, Config, Wallet } from '../../types';
import Head from "next/head";
import { getServerSidePropsWithAuth, ServerProps } from "../../util/get-server-side-props-with-auth";
import WalletForm from "../../components/wallet-form";
import { updateQuotes } from '../../util/services';
import { getAssetsValues } from '../../util/helpers';
import Swal from 'sweetalert2';

export const getServerSideProps = getServerSidePropsWithAuth;

const WalletPage = (props: ServerProps) => {
  const router = useRouter();
  const { id, edit } = router.query;
  const walletRef = doc(firestore, 'wallets/' + id);
  const configRef = doc(firestore, 'config/' + props.authUserId);
  const [wallet, setWallet] = useState<Wallet | undefined>();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [config, setConfig] = useState<Config>();
  let assetsValues = getAssetsValues(assets);

  const getWallet = async () => {
    // construct a query to get up to 10 undone todos 
    // get the todos
    const result = await getDoc(walletRef);

    // map through todos adding them to an array

    // set it to state
    const w = result.data() as Wallet;
    let asts: Asset[] = [];
    if (w.assets) {
      const results = Object.values(w.assets).map(async assetRef => {
        return getDoc(assetRef).then(assetResult => ({ ...assetResult.data(), id: assetRef.id } as Asset));
      });
      asts = await Promise.all(results);
    }
    setAssets(asts);
    setWallet(w);
  };

  const getConfig = async () => {
    const result = await getDoc(configRef);
    const c = result.data() as Config;
    setConfig(c);
  };

  const saveWallet = async (value: Wallet) => {
    if (id === 'new') {
      value.owner = props.authUserId;
      const docRef = await addDoc(collection(firestore, 'wallets'), value);
      router.replace('/wallet/' + docRef.id);
    } else {
      const walletUpdated = {
        ...value,
        invested: assetsValues.get('total').invested,
        lastValue: assetsValues.get('total').value,
        risk: assetsValues.get('total').globalRisk
      }
      const result = await updateDoc(walletRef, walletUpdated);
      router.replace('/');
    }
    Swal.fire(
      'Good job!',
      'Wallet saved successfully!',
      'success'
    );
  }

  const addValue = async (av: AssetValue) => {
    const valueRef = await addDoc(collection(firestore, 'assetsValues'), av);
    const assetRef = doc(firestore, 'assets/' + av.assetId);
    await updateDoc(assetRef, {
      lastQuantity: av.quantity,
      lastValue: av.value,
      lastInvested: av.invested
    });
    router.reload();
    Swal.fire(
      'Good job!',
      'Value saved successfully!',
      'success'
    );
  }

  const updateAssetsQuotes = async (assets: Asset[]) => {
    const assetsUpdated = await updateQuotes(assets,config);
    assetsValues = getAssetsValues(assetsUpdated);
    if (wallet) await saveWallet(wallet);
    setAssets(assetsUpdated);
    Swal.fire(
      'Good job!',
      'Assets quotes updated successfully!',
      'success'
    );
  }

  useEffect(() => {
    switch (id) {
      case undefined: return void 0;
      case 'new':
        break;
      default: 
        getWallet();
        getConfig();
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

        {id && id !== 'new' && !edit ? (
          <>
            <h1 className="mt-4 text-center">{wallet?.label}</h1>
            <AssetList assets={assets}
              walletId={id as string}
              assetsValues={assetsValues}
              onSubmit={addValue}
              updateQuotes={updateAssetsQuotes} />
          </>) : <></>}

        {id === 'new' || edit ? <WalletForm wallet={wallet} onSubmit={saveWallet} /> : <></>}
      </FireDreamContainer>
    </>
  )
}

export default WalletPage;