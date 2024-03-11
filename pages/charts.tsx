import Head from 'next/head';
import { FireDreamContainer } from '../components';
import styles from '../styles/Home.module.css'
import { firestore } from '../util/firebase-client';
import { getDoc } from "@firebase/firestore";
import { useEffect, useState } from 'react';
import { Asset, Config, Wallet } from '../types';
import { getServerSidePropsWithAuth, ServerProps } from '../util/get-server-side-props-with-auth';
import ChartsPanel from '../components/charts-panel';
import { getOrUpdateCachedValues, getWalletsAndAssets } from '../util/services';
import Swal from 'sweetalert2';
import { Form } from 'react-bootstrap';
import { doc } from 'firebase/firestore';

export const getServerSideProps = getServerSidePropsWithAuth;

const Charts = (props: ServerProps) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallets, setSelectedWallets] = useState<Wallet[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [timeValues, setTimeValues] = useState<{ timeAssetValues: any[], timeCategoryValues: any[], timeTotalValues: any[] }>(
    { timeAssetValues: [], timeCategoryValues: [], timeTotalValues: [] }
  );
  const configRef = doc(firestore, 'config/' + props.authUserId);
  const [config, setConfig] = useState<Config>();

  const getConfig = async () => {
    const result = await getDoc(configRef);

    const c = result.data() as Config;
    setConfig(c);
    return c;
  };

  const getWallets = async () => {
    const { wallets:w, assets:a } = await getWalletsAndAssets(props.authUserId);

    await getConfig();
    setAssets(a);
    setWallets(w);
    await filterWallets(w.filter(wa => wa.type == 'investment'), a);
  };

  const updateTimeValues = async (a: Asset[], forceUpdate = false, normalize = false) => {
    if (forceUpdate) (document.getElementById('filterWallet') as HTMLSelectElement).value = 'all';
    let cfg = config || await getConfig();
    let tv = await getOrUpdateCachedValues(props.authUserId, a, cfg?.chartPeriodMonths ?? 6, forceUpdate, normalize, cfg?.revaluationTax ?? 0);
    tv = {
      timeAssetValues: checkTimeValuesConsistence(tv.timeAssetValues) ? tv.timeAssetValues : [],
      timeCategoryValues: checkTimeValuesConsistence(tv.timeCategoryValues) ? tv.timeCategoryValues : [],
      timeTotalValues: checkTimeValuesConsistence(tv.timeTotalValues) ? tv.timeTotalValues : []
    }
    setTimeValues(tv);
    if (forceUpdate) Swal.fire(
      'Good job!',
      'Time values updated successfully!',
      'success'
    );
  }

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

  const filterAssets = (ws: Wallet[], as: Asset[]) => {
    let newAssets: Asset[] = [];
    ws.forEach(w => {
      newAssets = newAssets.concat(as.filter(a => undefined !== Object.values(w.assets).find(wa => wa.id == a.id)));
    })

    return newAssets;
  }

  const filterWallets = async (ws: Wallet[], as: Asset[]) => {
    setSelectedWallets(ws);
    const filteredAssets = filterAssets(ws, as);
    setSelectedAssets(filteredAssets);
    await updateTimeValues(filteredAssets);
  }

  const filterWalletsHandler = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const id = event.target.value;
    console.log(id);
    if (id === 'all') {
      await filterWallets(wallets, assets);
    } else {
      await filterWallets(wallets.filter(wallet => wallet.id == id), assets);
    }
  }

  const normalizeSwitchHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.checked);
    await updateTimeValues(selectedAssets,false,event.target.checked);
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
      <FireDreamContainer wallets={wallets}>
        <div className="row mt-4">
          <div className="col-lg-10 offset-lg-1 text-center">
            <Form.Select aria-label="Filter wallet" id="filterWallet" onChange={filterWalletsHandler}>
              <option value="all">all</option>
              {wallets.map(wallet => <option key={wallet.id} selected={wallet.type == 'investment'} value={wallet.id}>{wallet.label}</option>)}
            </Form.Select>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-lg-10 offset-lg-1">
            <Form.Check
              onChange={normalizeSwitchHandler}
              type="switch"
              id="normalize-switch"
              label="Normalize"
            />
          </div>
        </div>
        <ChartsPanel wallets={selectedWallets} assets={selectedAssets} timeValues={timeValues} config={config as Config}/>
        <div className="row mt-5 mb-5 pt-5 pb-5">
          <div className="col-12 text-center">
            <a className="btn btn-lg btn-dark" role="button" onClick={async () => await updateTimeValues(assets, true)}>Update</a>
          </div>
        </div>
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