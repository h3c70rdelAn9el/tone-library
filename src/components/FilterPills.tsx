import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTagList } from '../hooks/useTagList';
import { useToneStore } from '../store/useToneStore';

export default function FilterPills() {
  const activeTags = useToneStore((s) => s.activeTags);
  const setActiveTags = useToneStore((s) => s.setActiveTags);
  const toggleActiveTag = useToneStore((s) => s.toggleActiveTag);
  const clearFilters = useToneStore((s) => s.clearFilters);
  const searchQuery = useToneStore((s) => s.searchQuery);
  const { tags: allTags } = useTagList();

  const hasFilters =
    searchQuery.trim().length > 0 || activeTags.length > 0;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <motion.button
        type="button"
        layout
        onClick={() => setActiveTags([])}
        className={`shrink-0 rounded-full border px-4 py-2 font-body text-sm font-medium transition-colors duration-200 ${
          activeTags.length === 0
            ? 'border-brand-accent bg-brand-accent text-black shadow-[0_0_20px_-4px_rgba(232,255,71,0.45)]'
            : 'border-brand-border text-brand-subtext hover:border-brand-accent/35 hover:text-brand-text'
        }`}
      >
        All
      </motion.button>
      {allTags.map((tag) => (
        <motion.button
          key={tag}
          type="button"
          layout
          onClick={() => toggleActiveTag(tag)}
          className={`shrink-0 rounded-full border px-4 py-2 font-body text-sm font-medium capitalize transition-colors duration-200 ${
            activeTags.includes(tag)
              ? 'border-brand-accent bg-brand-accent text-black shadow-[0_0_20px_-4px_rgba(232,255,71,0.45)]'
              : 'border-brand-border text-brand-subtext hover:border-brand-accent/35 hover:text-brand-text'
          }`}
        >
          {tag}
        </motion.button>
      ))}
      {hasFilters ? (
        <button
          type="button"
          onClick={() => clearFilters()}
          className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-brand-border px-3 py-2 font-body text-xs font-medium text-brand-subtext hover:border-brand-accent/40 hover:text-brand-text"
          aria-label="Clear filters"
        >
          <X size={14} />
          Clear
        </button>
      ) : null}
    </div>
  );
}
