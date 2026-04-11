import { useMemo, useState } from 'react';
import { useToneStore } from '../store/useToneStore';
import { useTones } from '../hooks/useTones';
import ToneCard from '../components/ToneCard';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { Search, X } from 'lucide-react';
import type { Tone } from '../types/tone';

function uniqueTagsFromTones(tones: Tone[]): string[] {
  const set = new Set<string>();
  for (const tone of tones) {
    for (const tag of tone.tags) {
      set.add(tag);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export default function LibraryPage() {
  const { tones, loading, error } = useTones();
  const syncStatus = useToneStore((s) => s.syncStatus);
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const allTags = useMemo(() => uniqueTagsFromTones(tones), [tones]);

  const filtered = tones.filter((tone) => {
    const matchesQuery =
      tone.name.toLowerCase().includes(query.toLowerCase()) ||
      tone.notes.toLowerCase().includes(query.toLowerCase());
    const matchesTag = activeTag ? tone.tags.includes(activeTag) : true;
    return matchesQuery && matchesTag;
  });

  const showFallbackBanner =
    (syncStatus === 'error' || error) && !bannerDismissed;

  return (
    <div className="p-8">
      {showFallbackBanner ? (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-400">
          <p className="font-body">
            Supabase unavailable — showing local data
          </p>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className="shrink-0 text-amber-400/80 hover:text-amber-400"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}

      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-brand-text mb-1">
          Tone Library
        </h1>
        <p className="text-brand-subtext text-sm">{tones.length} tones saved</p>
      </div>

      <div className="relative mb-5">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted"
        />
        <input
          type="text"
          placeholder="Search tones..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md bg-brand-card border border-brand-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-colors"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          type="button"
          onClick={() => setActiveTag(null)}
          className={`font-body text-sm font-medium px-4 py-2 rounded-full border transition-all duration-200 ${
            activeTag === null
              ? 'bg-brand-accent text-black border-brand-accent shadow-[0_0_20px_-4px_rgba(232,255,71,0.45)]'
              : 'bg-brand-card/60 text-brand-subtext border-brand-border hover:border-brand-accent/35 hover:text-brand-text'
          }`}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            type="button"
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`font-body text-sm font-medium px-4 py-2 rounded-full border capitalize transition-all duration-200 ${
              activeTag === tag
                ? 'bg-brand-accent text-black border-brand-accent shadow-[0_0_20px_-4px_rgba(232,255,71,0.45)]'
                : 'bg-brand-card/60 text-brand-subtext border-brand-border hover:border-brand-accent/35 hover:text-brand-text'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState message="No tones match your search." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((tone) => (
            <ToneCard key={tone.id} tone={tone} />
          ))}
        </div>
      )}
    </div>
  );
}
