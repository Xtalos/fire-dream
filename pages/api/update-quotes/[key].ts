// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { query, where, getDocs, QueryDocumentSnapshot, DocumentData, getDoc, collection, doc } from '@firebase/firestore';
import { firestore } from '../../../util/firebase-client';
import { Config } from 'firebase/auth';
import type { NextApiRequest, NextApiResponse } from 'next'
import { Wallet } from '../../../types';
import { Auth, signInWithEmailAndPassword } from "../../../util/firebase-client";
import bcrypt from 'bcrypt';
import { getWalletsAndAssets, updateWalletsQuotes } from '../../../util/services';

type Data = {
  message?: string,
  errorMessage?: string
}

type SecretObject = {
  uid: string,
  secret: string
}

const walletsCollection = collection(firestore, 'wallets');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await signInWithEmailAndPassword(Auth, process.env.FIREDREAM_GLOBAL_ACCOUNT_NAME as string, process.env.FIREDREAM_GLOBAL_ACCOUNT_PASSWORD as string);

  const { key, wallet } = req.query;
  let keyObject;

  try {
    keyObject = JSON.parse(Buffer.from(key as string,'base64').toString('utf-8')) as SecretObject;
  } catch(e) {
    res.status(401).json({ errorMessage: 'forbidden, invalid address' })
    return;
  }

  const boo = keyObject.secret;
  if(!keyObject || !bcrypt.compareSync(keyObject.uid+(process.env.FIREDREAM_UPDATE_QUOTE_SECRET_KEY as string),keyObject.secret)) {
    res.status(401).json({ errorMessage: 'forbidden' })
    return;
  } 
  //const boo = bcrypt.hashSync(keyObject.uid+(process.env.FIREDREAM_UPDATE_QUOTE_SECRET_KEY as string),10);

  /* const configRef = doc(firestore, 'config/' + key);

  const walletsQuery = query(walletsCollection, where('owner', '==', keyObject.uid), where('active', '==', true));
  const querySnapshot = await getDocs(walletsQuery);
  const response: QueryDocumentSnapshot<DocumentData>[] = [];
  querySnapshot.forEach((snapshot) => {
    response.push(snapshot);
  });

  const w = response.map(item => ({ ...item.data(), id: item.id } as Wallet));
  const result = await getDoc(configRef);
  const c = result.data() as Config;
 */

  try {
    const { wallets, assets } = await getWalletsAndAssets(keyObject.uid);
    await updateWalletsQuotes(wallets);
  } catch(e) {
    console.log(e);
    res.status(500).json({ errorMessage: 'Internal Error'});
    return;
  }

  res.status(200).json({ message: 'Values Updated Successfully!' })
}
