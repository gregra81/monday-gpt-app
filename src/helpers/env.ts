import { EnvironmentVariablesManager } from '@mondaycom/apps-sdk';

const envManager = new EnvironmentVariablesManager({ updateProcessEnv: true });

export const envGet = <T = string>(key: string) => envManager.get(key) as T;
export const envGetKeys = () => envManager.getKeys();
