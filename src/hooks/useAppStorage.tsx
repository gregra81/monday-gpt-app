import { useState, useEffect } from 'react';
import { storage } from '../helpers/storage/client';
function useAppStorage<T>(key: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const resp = await storage().getItem(key);
      try {
        if (!resp) {
          setData(null);
          return;
        }
        const data = JSON.parse(resp) as T;
        setData(data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [key]);

  return { data, error, loading };
}

export default useAppStorage;
