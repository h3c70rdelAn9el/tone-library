import { Search, X } from 'lucide-react';

type SearchBarProps = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search tones...',
}: SearchBarProps) {
  return (
    <div className="relative mb-5 max-w-md">
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-brand-card border border-brand-border rounded-xl pl-9 pr-10 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-colors"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      ) : null}
    </div>
  );
}
