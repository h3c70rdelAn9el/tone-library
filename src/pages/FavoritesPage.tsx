import { useState } from 'react';
import { Star } from 'lucide-react';
import { useTones } from '../hooks/useTones';
import ToneCard from '../components/ToneCard';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import SearchBar from '../components/SearchBar';
import { useToneStore } from '../store/useToneStore';

export default function FavoritesPage() {
  const [search, setSearch] = useState('');
  const totalFavorites = useToneStore((s) =>
    s.tones.filter((t) => t.favorite).length,
  );

  const { tones, loading } = useTones({
    favoritesOnly: true,
    query: search,
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-brand-text mb-1 flex items-center gap-2 flex-wrap">
          <Star
            size={28}
            className="text-brand-accent shrink-0 fill-brand-accent"
          />
          Favorites
        </h1>
        <p className="text-brand-subtext text-sm">
          {totalFavorites} favorite{totalFavorites === 1 ? '' : 's'}
        </p>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search favorites..."
      />

      {loading ? (
        <LoadingState />
      ) : tones.length === 0 ? (
        <EmptyState message="No favorites yet — star a tone to save it here" />
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
