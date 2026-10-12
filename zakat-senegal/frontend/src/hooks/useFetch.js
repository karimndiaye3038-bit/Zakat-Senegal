import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

// Chargement simple d'une ressource GET avec états loading / error / reload.
export function useFetch(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    if (!path) return;
    setLoading(true);
    setError('');
    api.get(path).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [path]);

  useEffect(load, [load]);
  return { data, loading, error, reload: load };
}
