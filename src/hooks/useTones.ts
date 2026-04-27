import { useCallback, useEffect, useState } from 'react';
import {
  tryFetchAllTones,
  tryFetchFavoriteToneIds,
  trySearchTones,
  filterTonesLocally,
} from '../services/toneService';
import { useToneStore } from '../store/useToneStore';
import { useAuth } from '../context/AuthContext';
import { mockTones } from '../data/mockTones';
import type { ToneCard } from '../types/tone';

export type UseTonesParams = {
  query?: string;
  tags?: string[];
  favoritesOnly?: boolean;
};

const EMPTY_TAGS: string[] = [];

function cloneMockTones(): ToneCard[] {
  return mockTones.map((t) => ({ ...t }));
}

export function useTones(params?: UseTonesParams) {
  const { user, loading: authLoading } = useAuth();
  const setTones = useToneStore((s) => s.setTones);
  const setFavoriteToneIds = useToneStore((s) => s.setFavoriteToneIds);
  const setSyncStatus = useToneStore((s) => s.setSyncStatus);
  const setGuest = useToneStore((s) => s.setGuest);
  const favoriteToneIds = useToneStore((s) => s.favoriteToneIds);

  const query = params?.query?.trim() ?? '';
  const tags = params?.tags ?? EMPTY_TAGS;
  const favoritesOnly = params?.favoritesOnly ?? false;
  /** Guest: re-filter when stars change. Authed favorites view: refetch when stars change. */
  const favoriteDep =
    !user || favoritesOnly ? favoriteToneIds.join('|') : '';

  const [displayTones, setDisplayTones] = useState<ToneCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runFetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!user) {
      const mock = cloneMockTones();
      setTones(mock);
      setGuest(true);
      setSyncStatus('guest');
      const favSet = new Set(useToneStore.getState().favoriteToneIds);
      const hasParams = query.length > 0 || tags.length > 0 || favoritesOnly;
      if (!hasParams) {
        setDisplayTones(mock);
      } else {
        setDisplayTones(filterTonesLocally(mock, query, tags, favoritesOnly, favSet));
      }
      setLoading(false);
      return;
    }

    setGuest(false);

    const hasParams = query.length > 0 || tags.length > 0 || favoritesOnly;

    if (!hasParams) {
      const remote = await tryFetchAllTones();
      const favIds = await tryFetchFavoriteToneIds();
      if (remote !== null && favIds !== null) {
        setTones(remote);
        setFavoriteToneIds(favIds);
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
      const favSet = new Set(useToneStore.getState().favoriteToneIds);
      setDisplayTones(
        filterTonesLocally(
          useToneStore.getState().tones,
          query,
          tags,
          favoritesOnly,
          favSet,
        ),
      );
    }
    setLoading(false);
  }, [
    user,
    query,
    tags,
    favoritesOnly,
    favoriteDep,
    setTones,
    setFavoriteToneIds,
    setSyncStatus,
    setGuest,
  ]);

  useEffect(() => {
    if (authLoading) return;
    const t = window.setTimeout(() => {
      void runFetch();
    }, 0);
    return () => window.clearTimeout(t);
  }, [runFetch, authLoading]);

  return {
    tones: displayTones,
    loading: loading || authLoading,
    error,
    refetch: runFetch,
  };
}
