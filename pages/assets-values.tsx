import Head from 'next/head';
import { AssetsValuesFilter, AssetsValuesFormList, FireDreamContainer } from '../components';
import styles from '../styles/Home.module.css'
import React, { useEffect, useState } from 'react';
import { Asset, AssetValue } from '../types';
import { getServerSidePropsWithAuth, ServerProps } from '../util/get-server-side-props-with-auth';
import { createNewAssetValue, deleteFromDB, getAssetsValuesByPeriod, getWalletsAndAssets, saveOnDB } from '../util/services';
import Swal from 'sweetalert2';
import { Modal } from 'react-bootstrap';
import AssetValueTransferForm from '../components/asset-value-transfer-form';
import { useRouter } from 'next/router';


export const getServerSideProps = getServerSidePropsWithAuth;

const AssetsValues = (props: ServerProps) => {
  const router = useRouter();
  const [showTransferForm, setShowTransferForm] = useState<boolean>(false);
  const [assetsValues, setAssetsValues] = useState<AssetValue[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState<{ start?: string, end?: string }>({});

  const deleteAssetValue = async (id: string) => {
    try {
      await deleteFromDB('assetsValues', id);
      const assetsValuesCopy = assetsValues.filter(av => av.id != id);
      setAssetsValues(assetsValuesCopy);
    } catch (e) {
      console.error(e);
    }
  }

  const saveAssetValue = async (assetValue: AssetValue) => {
    try {
      await saveOnDB('assetsValues', assetValue);
      const assetsValuesIndex = assetsValues.findIndex(av => av.id == assetValue.id);
      let assetsValuesCopy = [...assetsValues];
      assetsValuesCopy[assetsValuesIndex] = assetValue;
      setAssetsValues(assetsValuesCopy);
      Swal.fire(
        'Good job!',
        'Value updated successfully!',
        'success'
      );
    } catch (e) {
      console.error(e);
    }
  }

  const transferValues = async (fromAssetValue: AssetValue, toAssetValue: AssetValue) => {
    try {
      await createNewAssetValue(fromAssetValue);
      await createNewAssetValue(toAssetValue);
      Swal.fire(
        'Good job!',
        'Values updated successfully!',
        'success'
      );
      router.reload();
    } catch (e) {
      console.error(e);
    }
  }

  const getAssets = async () => {
    const { assets: asts } = await getWalletsAndAssets(props.authUserId);
    setAssets(asts);
  }

  const getValues = async (fltr: { start: string, end: string }) => {
    console.log(filter);
    setFilter(fltr);
    const av = await getAssetsValuesByPeriod(assets, fltr.start, fltr.end);
    setAssetsValues(av);
  }

  useEffect(() => {
    getAssets();
  }, []);


  return (
    <>
      <Head>
        <title>{process.env.APP_NAME}</title>
        <meta name="configPage" content="Configuration page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <FireDreamContainer>
        <div className="row">
          <div className="col-12 text-center">
            <button type="submit" onClick={() => setShowTransferForm(true)} className="text-center mb-4 btn btn-lg btn-dark">Transfer Values</button>
          </div>
        </div>
        <AssetsValuesFilter filter={filter} onFilter={getValues} />
        {assetsValues.length ? <AssetsValuesFormList assets={assets} assetValues={assetsValues} saveAssetValue={saveAssetValue} deleteAssetValue={deleteAssetValue} /> : <></>}
        {showTransferForm &&
          <Modal show={showTransferForm} onHide={() => setShowTransferForm(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Transfer Asset Value</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <AssetValueTransferForm assets={assets} onSubmit={transferValues} />
            </Modal.Body>
          </Modal>}
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
export default AssetsValues;