import { useMemo, useState } from 'react';
import { useToneStore } from '../store/useToneStore';
import ToneCard from '../components/ToneCard';
import EmptyState from '../components/EmptyState';
import { Search } from 'lucide-react';
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
  const tones = useToneStore((s) => s.tones);
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => uniqueTagsFromTones(tones), [tones]);

  const filtered = tones.filter((tone) => {
    const matchesQuery =
      tone.name.toLowerCase().includes(query.toLowerCase()) ||
      tone.notes.toLowerCase().includes(query.toLowerCase());
    const matchesTag = activeTag ? tone.tags.includes(activeTag) : true;
    return matchesQuery && matchesTag;
  });

  return (
    <div className="p-8">
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
