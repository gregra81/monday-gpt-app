import type { NextApiRequest, NextApiResponse } from 'next';
import * as jwt from 'jsonwebtoken';
import { Http401Error, Http500Error } from './errors';

export const mondayWorkflowAuthentication = (req: NextApiRequest, res: NextApiResponse) => {
  const signingSecret = process.env.MONDAY_SIGNING_SECRET;
  if (!signingSecret) {
    throw new Http500Error('Unable to authenticate request');
  }
  const authorization = req.headers.authorization ?? req.query?.token;
  if (!authorization) {
    throw new Http401Error('not authenticated, no credentials in request');
  }
  const { accountId, userId, backToUrl, shortLivedToken } = jwt.verify(authorization, signingSecret);
  if (!accountId || !userId || !shortLivedToken) {
    throw new Http401Error('authentication error, could not verify credentials');
  }

  return {
    accountId,
    userId,
    backToUrl,
    shortLivedToken,
  };
};

export const mondayViewAuthentication = (req: NextApiRequest, res: NextApiResponse) => {
  const appSecret = process.env.MONDAY_APP_SECRET;
  if (!appSecret) {
    throw new Http500Error('Unable to authenticate request');
  }
  const authorization = req.headers.authorization ?? req.query?.token;
  if (!authorization) {
    throw new Http401Error('not authenticated, no credentials in request');
  }
  const { exp, dat } = jwt.verify(authorization, appSecret);
  if (checkIfExpired(exp)) {
    throw new Http401Error('authentication error, expired token');
  }
  const { account_id: accountId, user_id: userId } = dat || {};
  if (!accountId || !userId) {
    return res.status(401).json({ error: 'authentication error, could not verify credentials' });
  }
  return {
    accountId,
    userId,
  };
};

const checkIfExpired = (exp: number) => {
  const today = Math.floor(new Date().getTime() / 1000);
  return today > exp;
};
