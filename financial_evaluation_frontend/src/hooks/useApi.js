import { useCallback, useState } from 'react';

/**
 * useApi wraps an async function to provide loading and error state handling.
 * It returns { run, loading, error, data, reset }.
 */
export function useApi(asyncFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError('');
      try {
        const res = await asyncFn(...args);
        if (!res || res.ok !== true) {
          const msg = (res && res.message) || 'Request failed';
          setError(msg);
          setData(null);
          return res;
        }
        setData(res.data);
        return res;
      } catch {
        setError('Unexpected error');
        setData(null);
        return { ok: false, message: 'Unexpected error' };
      } finally {
        setLoading(false);
      }
    },
    [asyncFn]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError('');
    setData(null);
  }, []);

  return { run, loading, error, data, reset };
}
