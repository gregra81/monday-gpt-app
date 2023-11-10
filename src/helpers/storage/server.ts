import { Storage } from '@mondaycom/apps-sdk';
import { StorageUtil } from './common';

export const storage = (token: string) => new StorageUtil(new Storage(token));
