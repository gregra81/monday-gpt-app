import mondaySdk from 'monday-sdk-js';
import { StorageUtil } from './common';

export const storage = () => {
  const monday = mondaySdk();
  const storageCommon = {
    set: monday.storage.setItem,
    get: monday.storage.getItem,
    delete: monday.storage.deleteItem,
  };

  return new StorageUtil(storageCommon);
};
