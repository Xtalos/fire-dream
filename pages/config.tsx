import Head from 'next/head';
import { FireDreamContainer } from '../components';
import styles from '../styles/Home.module.css'
import { firestore } from '../util/firebase-client';
import { getDoc, setDoc } from "@firebase/firestore";
import { useEffect, useState } from 'react';
import { Config } from '../types';
import { getServerSidePropsWithAuth, ServerProps } from '../util/get-server-side-props-with-auth';
import { doc } from 'firebase/firestore';
import ConfigForm from '../components/config-form';
import Swal from 'sweetalert2';
import { getUpdateQuotesUrl } from '../util/services';


export const getServerSideProps = getServerSidePropsWithAuth;

const Config = (props: ServerProps) => {
  const configRef = doc(firestore, 'config/' + props.authUserId);
  const [config, setConfig] = useState<Config>();
  const [updateQuotesUrl, setUpdateQuotesUrl] = useState<string>();

  const getConfig = async () => {
    const result = await getDoc(configRef);

    const c = result.data() as Config;
    const qUrl = await getUpdateQuotesUrl(props.authUserId);
    setConfig(c);
    setUpdateQuotesUrl(qUrl);
  };

  useEffect(() => {
    // get the todos
    getConfig();
    // reset loading
    // setTimeout(() => {
    //   setLoading(false);
    // }, 2000)
  }, []);

  const saveConfig = async (configUpdated: Config) => {
    const result = await setDoc(configRef, configUpdated);
    Swal.fire(
      'Good job!',
      'Config updated successfully!',
      'success'
    );
  }

  return (
    <>
      <Head>
        <title>{process.env.APP_NAME}</title>
        <meta name="configPage" content="Configuration page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <FireDreamContainer>
        <ConfigForm config={config} updateQuotesUrl={updateQuotesUrl} onSubmit={saveConfig}/>
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
export default Config