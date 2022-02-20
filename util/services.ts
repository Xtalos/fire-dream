import axios from 'axios';
import { Asset, AssetValue, Wallet } from '../types';
import { writeBatch, doc, collection, getDoc } from 'firebase/firestore';
import { firestore } from './firebase-client';
import { getAssetsValues } from './helpers';


export const updateQuotes = async (assets: Asset[]) => {
    const batch = writeBatch(firestore);
    const response = await axios.post('/api/quote', { assets });
    const assetValuesCollection = collection(firestore, 'assetsValues');

    const quotes = response.status === 200 ? response.data.values as AssetValue[] : [];
    quotes.filter(quote => quote.value).forEach(quote => {
        const assetValueRef = doc(assetValuesCollection);
        const assetRef = doc(firestore, 'assets/' + quote.assetId);
        batch.set(assetValueRef, quote);
        batch.update(assetRef, { lastValue: quote.value });
    });
    await batch.commit();
    const assetPromises = assets.map(asset => getDoc(doc(firestore, 'assets/' + asset.id)).then(assetResult => ({ ...assetResult.data(), id: asset.id } as Asset)));

    return await Promise.all(assetPromises);
}

export const updateWalletsQuotes = async (wallets: Wallet[]) => {
    const batch = writeBatch(firestore);
    const feedBatch = (wallet: Wallet) => {
        const results = Object.values(wallet.assets).map(assetRef => {
            return getDoc(assetRef).then(assetResult => ({ ...assetResult.data(), id: assetRef.id } as Asset));
        });
        return Promise.all(results)
            .then(updateQuotes)
            .then(assets => {
                const assetsValues = getAssetsValues(assets);
                const walletRef = doc(firestore, 'wallets/' + wallet.id);
                const updateWallet = {
                    invested: assetsValues.get('total').invested,
                    lastValue: assetsValues.get('total').value,
                    risk: assetsValues.get('total').globalRisk
                };
                batch.update(walletRef, updateWallet);
                return {
                    ...wallet,
                    ...updateWallet
                }
            });
    }
    const batchPromises = wallets.filter(wallet => wallet.assets).map(feedBatch);
    const updatedWallets = await Promise.all(batchPromises);
    await batch.commit();

    return updatedWallets;
}