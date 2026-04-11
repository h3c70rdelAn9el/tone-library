import { useState } from 'react';
import { mockTones } from '../data/mockTones';
import ToneCard from '../components/ToneCard';
import EmptyState from '../components/EmptyState';
import { Search } from 'lucide-react';

const ALL_TAGS = [
  'metal',
  'clean',
  'ambient',
  'blues',
  'djent',
  'country',
  'rhythm',
  'lead',
  'crunch',
  'high-gain',
] as const;

export default function LibraryPage() {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = mockTones.filter((tone) => {
    const matchesQuery =
      tone.name.toLowerCase().includes(query.toLowerCase()) ||
      tone.notes.toLowerCase().includes(query.toLowerCase());
    const matchesTag = activeTag ? tone.tags.includes(activeTag) : true;
    return matchesQuery && matchesTag;
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold uppercase tracking-widest text-brand-text mb-1">
          Tone Library
        </h1>
        <p className="text-brand-subtext text-sm">{mockTones.length} tones saved</p>
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
          className="w-full max-w-md bg-brand-card border border-brand-border rounded-md pl-9 pr-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent/50 transition-colors"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          type="button"
          onClick={() => setActiveTag(null)}
          className={`text-xs font-mono px-3 py-1 rounded-sm uppercase tracking-widest border transition-all ${
            activeTag === null
              ? 'bg-brand-accent text-black border-brand-accent'
              : 'bg-transparent text-brand-subtext border-brand-border hover:border-brand-accent/40'
          }`}
        >
          All
        </button>
        {ALL_TAGS.map((tag) => (
          <button
            type="button"
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`text-xs font-mono px-3 py-1 rounded-sm uppercase tracking-widest border transition-all ${
              activeTag === tag
                ? 'bg-brand-accent text-black border-brand-accent'
                : 'bg-transparent text-brand-subtext border-brand-border hover:border-brand-accent/40'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
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
