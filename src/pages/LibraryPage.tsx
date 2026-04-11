import { useMemo, useState } from 'react';
import { useToneStore } from '../store/useToneStore';
import { useTones } from '../hooks/useTones';
import { useTagList } from '../hooks/useTagList';
import ToneCard from '../components/ToneCard';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import SearchBar from '../components/SearchBar';
import { X } from 'lucide-react';

export default function LibraryPage() {
  const searchQuery = useToneStore((s) => s.searchQuery);
  const activeTags = useToneStore((s) => s.activeTags);
  const setSearchQuery = useToneStore((s) => s.setSearchQuery);
  const setActiveTags = useToneStore((s) => s.setActiveTags);
  const toggleActiveTag = useToneStore((s) => s.toggleActiveTag);
  const clearFilters = useToneStore((s) => s.clearFilters);
  const totalTones = useToneStore((s) => s.tones.length);
  const syncStatus = useToneStore((s) => s.syncStatus);

  const { tones, loading, error } = useTones({
    query: searchQuery,
    tags: activeTags,
  });
  const { tags: allTags } = useTagList();

  const [bannerDismissed, setBannerDismissed] = useState(false);

  const hasFilters =
    searchQuery.trim().length > 0 || activeTags.length > 0;

  const showFallbackBanner =
    (syncStatus === 'error' || error) && !bannerDismissed;

  const subheading = useMemo(() => {
    if (loading) {
      return `${totalTones} tones saved`;
    }
    if (hasFilters && totalTones > 0) {
      return `${tones.length} of ${totalTones} tones`;
    }
    return `${totalTones} tones saved`;
  }, [loading, hasFilters, totalTones, tones.length]);

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
        <p className="text-brand-subtext text-sm">{subheading}</p>
      </div>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {hasFilters ? (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => clearFilters()}
            className="text-xs font-body font-medium text-brand-subtext underline underline-offset-2 hover:text-brand-text"
          >
            Clear filters
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          type="button"
          onClick={() => setActiveTags([])}
          className={`font-body text-sm font-medium px-4 py-2 rounded-full border transition-all duration-200 ${
            activeTags.length === 0
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
            onClick={() => toggleActiveTag(tag)}
            className={`font-body text-sm font-medium px-4 py-2 rounded-full border capitalize transition-all duration-200 ${
              activeTags.includes(tag)
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
      ) : tones.length === 0 ? (
        <EmptyState message="No tones match your search." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {tones.map((tone) => (
            <ToneCard key={tone.id} tone={tone} />
          ))}
        </div>
      )}
    </div>
  );
}
