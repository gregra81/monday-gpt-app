import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { Http401Error, Http500Error } from './errors';
import type { ParsedUrlQuery } from 'querystring';
import { envGet } from './env';

export const mondayWorkflowAuthentication = (req: NextApiRequest, res: NextApiResponse) => {
  const signingSecret = envGet('MONDAY_SIGNING_SECRET');
  if (!signingSecret) {
    throw new Http500Error('Unable to authenticate request');
  }
  const authorization = req.headers.authorization ?? (req.query?.token as string);
  if (!authorization) {
    throw new Http401Error('not authenticated, no credentials in request');
  }

  // @ts-ignore
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

export const mondayViewAuthentication = (query: ParsedUrlQuery) => {
  const appSecret = envGet('MONDAY_APP_SECRET');
  if (!appSecret) {
    throw new Http500Error('Unable to authenticate request');
  }

  const sessionToken = query['sessionToken'] as string;
  if (!sessionToken) {
    throw new Http401Error('not authenticated, no sessionToken in query');
  }
  const { exp, dat } = jwt.verify(sessionToken, appSecret) as {
    exp: number;
    dat: { account_id: string; user_id: string };
  };
  if (checkIfExpired(exp)) {
    throw new Http401Error('authentication error, expired token');
  }

  if (!dat?.account_id || !dat?.user_id) {
    throw new Http401Error('authentication error, could not verify credentials');
  }

  const userId = Number(dat.user_id);
  const accountId = Number(dat.account_id);
  return {
    accountId,
    userId,
  };
};

const checkIfExpired = (exp: number) => {
  const today = Math.floor(new Date().getTime() / 1000);
  return today > exp;
};
