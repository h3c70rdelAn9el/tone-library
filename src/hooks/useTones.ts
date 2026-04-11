import { useCallback, useEffect, useState } from 'react';
import {
  tryFetchAllTones,
  trySearchTones,
  filterTonesLocally,
} from '../services/toneService';
import { useToneStore } from '../store/useToneStore';
import type { Tone } from '../types/tone';

export type UseTonesParams = {
  query?: string;
  tags?: string[];
  favoritesOnly?: boolean;
};

const EMPTY_TAGS: string[] = [];

export function useTones(params?: UseTonesParams) {
  const setTones = useToneStore((s) => s.setTones);
  const setSyncStatus = useToneStore((s) => s.setSyncStatus);

  const query = params?.query?.trim() ?? '';
  const tags = params?.tags ?? EMPTY_TAGS;
  const favoritesOnly = params?.favoritesOnly ?? false;

  const [displayTones, setDisplayTones] = useState<Tone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runFetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const hasParams =
      query.length > 0 || tags.length > 0 || favoritesOnly;

    if (!hasParams) {
      const remote = await tryFetchAllTones();
      if (remote !== null) {
        setTones(remote);
        setDisplayTones(remote);
        setSyncStatus('synced');
        setError(null);
      } else {
        setError('Could not sync with the server.');
        setSyncStatus('error');
        setDisplayTones(useToneStore.getState().tones);
      }
      setLoading(false);
      return;
    }

    const remote = await trySearchTones(query, tags, favoritesOnly);
    if (remote !== null) {
      setDisplayTones(remote);
      setSyncStatus('synced');
      setError(null);
    } else {
      setError('Could not sync with the server.');
      setSyncStatus('error');
      setDisplayTones(
        filterTonesLocally(
          useToneStore.getState().tones,
          query,
          tags,
          favoritesOnly,
        ),
      );
    }
    setLoading(false);
  }, [query, tags, favoritesOnly, setTones, setSyncStatus]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void runFetch();
    }, 0);
    return () => window.clearTimeout(t);
  }, [runFetch]);

  return {
    tones: displayTones,
    loading,
    error,
    refetch: runFetch,
  };
}
