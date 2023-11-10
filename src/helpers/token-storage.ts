import { SecureStorage } from '@mondaycom/apps-sdk';
import { NextApiRequest } from 'next';

const storage = new SecureStorage();
export function getToken<T = { value: string | null }>(key: string): Promise<T | null> {
  return storage.get(key);
}
export const setToken = (key: string, value: string) => storage.set(key, value);
export const removeToken = (key: string) => storage.delete(key);

export const getMondayToken = async (cookies: Record<string, string | undefined>): Promise<string | null> => {
  const tokenKey = cookies['monday_token'];
  if (!tokenKey) {
    return null;
  }
  const token = await getToken(tokenKey);

  return token?.value ?? null;
};
