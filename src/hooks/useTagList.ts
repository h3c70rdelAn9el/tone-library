import { useEffect, useMemo, useState } from 'react';
import { fetchAllTags } from '../services/toneService';
import { useToneStore } from '../store/useToneStore';
import { useAuth } from '../context/AuthContext';

function uniqueTagsFromTones(tones: { tags: string[] }[]): string[] {
  const set = new Set<string>();
  for (const tone of tones) {
    for (const tag of tone.tags) {
      set.add(tag);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function useTagList() {
  const { user, loading: authLoading } = useAuth();
  const storeTones = useToneStore((s) => s.tones);
  const [serverTags, setServerTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      const id = window.setTimeout(() => {
        setServerTags([]);
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(id);
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      const t = await fetchAllTags();
      if (!cancelled) {
        setServerTags(t);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const tags = useMemo(() => {
    const fromStore = uniqueTagsFromTones(storeTones);
    const merged = new Set<string>([...serverTags, ...fromStore]);
    return Array.from(merged).sort((a, b) => a.localeCompare(b));
  }, [serverTags, storeTones]);

  return { tags, loading };
}
