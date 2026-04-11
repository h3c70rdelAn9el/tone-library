import { useEffect, useMemo, useState } from 'react';
import { fetchAllTags } from '../services/toneService';
import { useToneStore } from '../store/useToneStore';

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
  const storeTones = useToneStore((s) => s.tones);
  const [serverTags, setServerTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const tags = useMemo(() => {
    const fromStore = uniqueTagsFromTones(storeTones);
    const merged = new Set<string>([...serverTags, ...fromStore]);
    return Array.from(merged).sort((a, b) => a.localeCompare(b));
  }, [serverTags, storeTones]);

  return { tags, loading };
}
