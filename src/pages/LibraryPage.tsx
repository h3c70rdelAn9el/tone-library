import { useEffect, useMemo, useState } from 'react';
import { useToneStore } from '../store/useToneStore';
import { useTones } from '../hooks/useTones';
import { useTagList } from '../hooks/useTagList';
import { useSelectedTone } from '../hooks/useSelectedTone';
import ToneCard from '../components/ToneCard';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import SearchBar from '../components/SearchBar';
import FilterPills from '../components/FilterPills';
import AmpDisplay from '../components/AmpDisplay';
import SignalIndicator from '../components/SignalIndicator';
import { X } from 'lucide-react';

const DEMO_TONE_COUNT = 6;

export default function LibraryPage() {
  // For mobile accordion
  const [mobileSection, setMobileSection] = useState<'amp' | 'tones'>('tones');
  const searchQuery = useToneStore((s) => s.searchQuery);
  const activeTags = useToneStore((s) => s.activeTags);
  const setSearchQuery = useToneStore((s) => s.setSearchQuery);
  const totalTones = useToneStore((s) => s.tones.length);
  const syncStatus = useToneStore((s) => s.syncStatus);
  const isGuest = useToneStore((s) => s.isGuest);

  const { selectedTone, selectTone } = useSelectedTone();

  const { tones, loading, error } = useTones({
    query: searchQuery,
    tags: activeTags,
  });
  useTagList();

  const [bannerDismissed, setBannerDismissed] = useState(false);

  const hasFilters = searchQuery.trim().length > 0 || activeTags.length > 0;

  const showFallbackBanner = (syncStatus === 'error' || error) && !bannerDismissed;

  const subheading = useMemo(() => {
    if (isGuest) {
      if (loading) return `${DEMO_TONE_COUNT} demo tones`;
      if (hasFilters) return `${tones.length} of ${DEMO_TONE_COUNT} demo tones`;
      return `${DEMO_TONE_COUNT} demo tones`;
    }
    if (loading) {
      return `${totalTones} tones saved`;
    }
    if (hasFilters && totalTones > 0) {
      return `${tones.length} of ${totalTones} tones`;
    }
    return `${totalTones} tones saved`;
  }, [loading, hasFilters, totalTones, tones.length, isGuest]);

  useEffect(() => {
    if (loading || tones.length === 0) return;
    if (!selectedTone || !tones.some((t) => t.id === selectedTone.id)) {
      selectTone(tones[0]);
    }
  }, [loading, tones, selectedTone, selectTone]);

  return (
    <div className="flex h-screen min-h-0 flex-1 flex-col overflow-hidden">
      {showFallbackBanner ? (
        <div className="mx-4 mt-3 flex shrink-0 items-start justify-between gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-400 lg:mx-8 lg:mt-6">
          <p className="font-body">Supabase unavailable — showing local data</p>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className="shrink-0 text-amber-400/80 hover:text-amber-400"
            aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      ) : null}

      <div className="shrink-0 border-b border-brand-border px-4 py-4 lg:px-8 lg:py-6">
        <div className="mb-4">
          <h1 className="mb-1 font-display-heading text-3xl font-semibold text-brand-text lg:text-4xl">
            ToneVault
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-sm text-brand-subtext">{subheading}</p>
            {selectedTone ? (
              <div className="flex items-center gap-3 border-l border-brand-border/80 pl-4">
                <SignalIndicator />
                <div className="min-w-0">
                  <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                    Active tone
                  </p>
                  <p className="truncate font-display text-sm font-semibold text-brand-accent">
                    {selectedTone.name}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
          />
          <FilterPills />
        </div>
      </div>

      {/* Mobile Accordion */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:hidden">
        <div className="flex">
          <button
            type="button"
            className={`flex-1 py-2 font-display text-lg font-semibold tracking-display border-b-2 transition-all duration-plugin ease-plugin ${mobileSection === 'amp' ? 'border-brand-accent text-brand-text' : 'border-transparent text-brand-subtext'}`}
            onClick={() => setMobileSection('amp')}>
            Amp
          </button>
          <button
            type="button"
            className={`flex-1 py-2 font-display text-lg font-semibold tracking-display border-b-2 transition-all duration-plugin ease-plugin ${mobileSection === 'tones' ? 'border-brand-accent text-brand-text' : 'border-transparent text-brand-subtext'}`}
            onClick={() => setMobileSection('tones')}>
            Tones
          </button>
        </div>
        {mobileSection === 'amp' && (
          <div className="flex-1 flex items-center justify-center px-4 py-6 min-h-0">
            <AmpDisplay tone={selectedTone} />
          </div>
        )}
        {mobileSection === 'tones' && (
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
            {loading ? (
              <LoadingState />
            ) : tones.length === 0 ? (
              <EmptyState message="No tones match your search." />
            ) : (
              <div className="flex w-full min-w-0 flex-col gap-2">
                {tones.map((tone, i) => (
                  <ToneCard
                    key={tone.id}
                    tone={tone}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Side-by-Side */}
      <div className="hidden min-h-0 flex-1 lg:flex lg:flex-row overflow-y-auto">
        <div className="flex shrink-0 items-center justify-center border-b border-brand-border px-4 py-6 lg:w-1/2 lg:border-b-0 lg:border-r lg:py-8 xl:w-3/5 min-h-0">
          <AmpDisplay tone={selectedTone} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto py-4 lg:py-6">
          {loading ? (
            <LoadingState />
          ) : tones.length === 0 ? (
            <EmptyState message="No tones match your search." />
          ) : (
            <div className="flex w-full min-w-0 flex-col gap-2 lg:pr-2">
              {tones.map((tone, i) => (
                <ToneCard
                  key={tone.id}
                  tone={tone}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
