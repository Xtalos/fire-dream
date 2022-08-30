// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Asset, AssetValue, Config } from '../../types';
import moment from 'moment';

type Data = {
  values: AssetValue[]
}

type ApiError = {
  error: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ApiError>
) {
  const values: AssetValue[] = [];
  const { assets, config } = req.body as { assets: Asset[], config: Config };
  const symbols = assets.filter(asset => asset.symbol && asset.symbol !== 'EUR').map(asset => asset.symbol);
  const createdOn = parseInt(moment().format('X'));

  const apiUrl = process.env.YAHOO_FINANCE_APIURL;
  const xApiKey = config?.yahooFinanceApiKey;

  const chunkPromises = symbols.map(symbol => {
    return axios.get(`https://finance.yahoo.com/quote/${symbol}?p=${symbol}&.tsrc=fin-srch`, {
      headers: {
        'x-api-key': `${xApiKey}`
      }
    }).then(function (response) {

      const result = response.data.match(/<fin-streamer(.*)data-test="qsp-price"(.*)value="([0-9.]+)"(.*)[0-9]<\/fin-streamer>/);
      const price = result[3];
      //console.log(price);

      const afs = assets.filter(asset => asset.symbol == symbol);
      afs.forEach(af => {
        values.push({
          value: price,
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
