interface Storage {
  set(key: string, value: string): Promise<any>;
  get(key: string): Promise<any>;
  delete(key: string): Promise<any>;
}

export class StorageUtil {
  constructor(private readonly storage: Storage) {
    this.storage = storage;
  }

  async setItem(key: string, value: string) {
    const resp = await this.storage.set(key, value);
    if (resp?.error) {
      throw new Error(resp.error);
    }
    return resp;
  }
  async addItemToArray(key: string, value: string) {
    const data = await this.getItem(key);
    let valueArray: string[] = [];
    if (data) {
      try {
        valueArray = JSON.parse(data);
      } catch (e) {
        console.warn('Failed to parse value from storage', e);
      } finally {
        valueArray.push(value);
      }
    } else {
      valueArray.push(value);
    }

    await this.setItem(key, JSON.stringify(valueArray));
  }

  async getItemAsArray(key: string) {
    const data = await this.getItem(key);
    let valueArray: string[] = [];
    if (data) {
      try {
        valueArray = JSON.parse(data);
      } catch (e) {
        console.warn('Failed to parse value as array', e);
      }
    }

    return valueArray;
  }

  async getItem(key: string) {
    const resp = await this.storage.get(key);
    if (resp?.error) {
      throw new Error(resp.error);
    }
    return resp?.data?.value ?? resp?.value ?? null;
  }

  async removeItem(key: string) {
    const resp = await this.storage.delete(key);
    if (resp?.error) {
      throw new Error(resp.error);
    }

    return resp;
  }
}
