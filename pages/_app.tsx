import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import '../styles/c3.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../util/auth';

function MyApp({ Component, pageProps }: AppProps) {
  return <AuthProvider><Component {...pageProps} /></AuthProvider>
}

export default MyApp
