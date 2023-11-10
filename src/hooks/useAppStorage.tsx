import { useState, useEffect } from 'react';
import { storage } from '../helpers/storage/client';
function useAppStorage(key: string) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const resp = await storage().getItem(key);
      try {
        if (!resp || !resp?.value) {
          setData(null);
          return;
        }
        setData(JSON.parse(resp?.value));
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
