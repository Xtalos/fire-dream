// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Asset, AssetValue, Config } from '../../types';
import moment from 'moment';

type ApiResponseValue = {
  regularMarketPrice: number
  symbol: string
}
type Data = {
  values: AssetValue[]
}

type ApiError = {
  error: any
}

const splitIntoChunks = (array: any[], chunkSize: number) => {
  let i, j;
  const chunks = [];
  for (i = 0, j = array.length; i < j; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }

  return chunks;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ApiError>
) {
  const values:AssetValue[] = [];
  const { assets, config } = req.body as { assets: Asset[], config: Config };
  const symbols = assets.filter(asset => asset.symbol && asset.symbol !== 'EUR').map(asset => asset.symbol);
  const chunks = splitIntoChunks(symbols,10);
  const createdOn = parseInt(moment().format('X'));

  const apiUrl = process.env.YAHOO_FINANCE_APIURL;
  const xApiKey = config?.yahooFinanceApiKey;

  const chunkPromises = chunks.map(chunk => {
    const search = chunk.length > 1 ? chunk.join(',') : chunk[0];
    return axios.get(`${apiUrl}?region=us&lang=en&symbols=${search}`,{
      headers: {
        'x-api-key': `${xApiKey}`
      }
    }).then(function (response) {
      const {quoteResponse:{result}} = response.data;
      result.forEach((element:ApiResponseValue) => {
        const af = assets.find(asset => asset.symbol == element.symbol);
        af && values.push({
          value: element.regularMarketPrice,
          assetId: af.id,
          invested: af.lastInvested,
          quantity: af.lastQuantity,
          createdOn
        });
      });
    }).catch(function (error) {
      console.error(error);
      res.status(403).json({ error });
      return;
    });
  });

  await Promise.all(chunkPromises);
  
  res.status(200).json({ values });
}
