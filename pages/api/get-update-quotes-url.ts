// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';


type Data = {
  url: string
}

const getUpdateQuotesUrl = (uid:string) => {
  const secret = bcrypt.hashSync(uid+(process.env.FIREDREAM_UPDATE_QUOTE_SECRET_KEY as string),10);

  return '/api/update-quotes/' + Buffer.from(JSON.stringify({uid,secret})).toString('base64');
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const uid = req.query.uid as string;
  const host = req.headers.host as string;
  const url = getUpdateQuotesUrl(uid);

  res.status(200).json({ url: host + url })
}
