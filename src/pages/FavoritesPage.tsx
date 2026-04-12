import { useEffect } from 'react';
import { Star } from 'lucide-react';
import { useTones } from '../hooks/useTones';
import { useSelectedTone } from '../hooks/useSelectedTone';
import ToneCard from '../components/ToneCard';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import SearchBar from '../components/SearchBar';
import FilterPills from '../components/FilterPills';
import AmpDisplay from '../components/AmpDisplay';
import { useTagList } from '../hooks/useTagList';
import { useToneStore } from '../store/useToneStore';

export default function FavoritesPage() {
  const searchQuery = useToneStore((s) => s.searchQuery);
  const activeTags = useToneStore((s) => s.activeTags);
  const setSearchQuery = useToneStore((s) => s.setSearchQuery);
  const totalFavorites = useToneStore((s) =>
    s.tones.filter((t) => t.favorite).length,
  );

  const { selectedTone, selectTone } = useSelectedTone();
  useTagList();

  const { tones, loading } = useTones({
    favoritesOnly: true,
    query: searchQuery,
    tags: activeTags,
  });

  useEffect(() => {
    if (loading || tones.length === 0) return;
    if (!selectedTone || !tones.some((t) => t.id === selectedTone.id)) {
      selectTone(tones[0]);
    }
  }, [loading, tones, selectedTone, selectTone]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-brand-border px-4 py-4 lg:px-8 lg:py-6">
          <div className="mb-4">
            <h1 className="mb-1 flex flex-wrap items-center gap-2 font-display text-3xl font-semibold tracking-tight text-brand-text lg:text-4xl">
              <Star
                size={28}
                className="shrink-0 fill-brand-accent text-brand-accent"
              />
              Favorites
            </h1>
            <p className="text-sm text-brand-subtext">
              {totalFavorites} favorite{totalFavorites === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search favorites..."
            />
            <FilterPills />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="flex shrink-0 items-center justify-center border-b border-brand-border px-4 py-6 lg:w-1/2 lg:border-b-0 lg:border-r lg:py-8 xl:w-3/5">
            <AmpDisplay tone={selectedTone} />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:w-1/2 lg:py-6 xl:w-2/5">
            {loading ? (
              <LoadingState />
            ) : tones.length === 0 ? (
              <EmptyState message="No favorites yet — star a tone to save it here" />
            ) : (
              <div className="flex w-full min-w-0 flex-col gap-2 lg:pr-2">
                {tones.map((tone, i) => (
                  <ToneCard key={tone.id} tone={tone} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
