import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { MONDAY_OAUTH_TOKEN_URL } from '../../../constants/monday';
import jwt from 'jsonwebtoken';
import { setToken } from '../../../helpers/token-storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authPayload = {
    redirect_uri: process.env.MONDAY_APP_AUTH_CALLBACK_URL,
    client_id: process.env.MONDAY_APP_CLIENT_ID,
    client_secret: process.env.MONDAY_APP_SECRET,
    code: req.query.code,
  };

  const response = await axios.post(MONDAY_OAUTH_TOKEN_URL, authPayload);
  const data = response.data;

  // store token in secret storage and redirect to app
  const decodedData = jwt.decode(data.access_token);

  // @ts-ignore
  const tokenKey = `monday_token_${decodedData.actid}_${decodedData.uid}`;
  await setToken(tokenKey, data.access_token);
  res.setHeader('set-cookie', `monday_token=${tokenKey}; path=/; samesite=lax; httponly;`);
  res.redirect('/');
}
