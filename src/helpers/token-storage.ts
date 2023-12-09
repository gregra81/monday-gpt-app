import { SecureStorage } from '@mondaycom/apps-sdk';

const storage = new SecureStorage();
export function getToken<T = { value: string | null }>(key: string): Promise<T | null> {
  return storage.get(key);
}
export const setToken = (key: string, value: string) => storage.set(key, value);
export const removeToken = (key: string) => storage.delete(key);

export const getMondayTokenKey = (accountId: number, userId: number) => `monday_token_${accountId}_${userId}`;

export const getMondayToken = async (accountId: number, userId: number): Promise<string | null> => {
  const tokenKey = getMondayTokenKey(accountId, userId);
  const token = await getToken(tokenKey);

  return token?.value ?? null;
};
