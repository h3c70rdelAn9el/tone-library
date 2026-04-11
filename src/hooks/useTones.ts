import { useCallback, useEffect, useState } from 'react';
import { tryFetchAllTones } from '../services/toneService';
import { useToneStore } from '../store/useToneStore';

export function useTones() {
  const setTones = useToneStore((s) => s.setTones);
  const setSyncStatus = useToneStore((s) => s.setSyncStatus);
  const tones = useToneStore((s) => s.tones);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const remote = await tryFetchAllTones();
    if (remote !== null) {
      setTones(remote);
      setSyncStatus('synced');
      setError(null);
    } else {
      setError('Could not sync with the server.');
      setSyncStatus('error');
    }
    setLoading(false);
  }, [setTones, setSyncStatus]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void refetch();
    }, 0);
    return () => window.clearTimeout(t);
  }, [refetch]);

  return { tones, loading, error, refetch };
}
