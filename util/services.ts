import axios from 'axios';
import { Asset, AssetValue } from '../types';
import { writeBatch, doc, collection, getDoc } from 'firebase/firestore';
import { firestore } from './firebase-client';


export const updateQuotes = async (assets:Asset[]) => {
    const batch = writeBatch(firestore);
    const response = await axios.post('/api/quote',{assets});
    const assetValuesCollection = collection(firestore, 'assetsValues');

    const quotes = response.status === 200 ? response.data.values as AssetValue[] : [];
    quotes.filter(quote => quote.value).forEach(quote => {
        const assetValueRef = doc(assetValuesCollection);
        const assetRef = doc(firestore, 'assets/' + quote.assetId);
        batch.set(assetValueRef,quote);
        batch.update(assetRef,{ lastValue:quote.value });
    });
    await batch.commit();
    const assetPromises = assets.map(asset => getDoc(doc(firestore, 'assets/' + asset.id)).then(assetResult => ({...assetResult.data(),id:asset.id} as Asset)));
    
    return await Promise.all(assetPromises);
}