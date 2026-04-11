import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import TagBadge from './TagBadge';
import clsx from 'clsx';
import type { Tone } from '../types/tone';
import { useToneStore } from '../store/useToneStore';
import { toggleFavorite as toggleFavoriteRemote } from '../services/toneService';
import { useSelectedTone } from '../hooks/useSelectedTone';

export default function ToneCard({
  tone,
  index = 0,
}: {
  tone: Tone;
  index?: number;
}) {
  const navigate = useNavigate();
  const toggleFavoriteLocal = useToneStore((s) => s.toggleFavorite);
  const { selectedTone, selectTone } = useSelectedTone();
  const isSelected = selectedTone?.id === tone.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05, ease: 'easeOut' }}
      role="button"
      tabIndex={0}
      onClick={() => selectTone(tone)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectTone(tone);
        }
      }}
      className={clsx(
        'group flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors duration-200',
        isSelected
          ? 'border-brand-accent/50 bg-brand-accent/10 shadow-[inset_3px_0_0_0_rgba(232,255,71,0.85)]'
          : 'border-brand-border bg-brand-card/80 hover:bg-brand-surface',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="min-w-0 truncate font-display text-base font-semibold tracking-tight text-brand-text group-hover:text-brand-accent">
            {tone.name}
          </h3>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {tone.tags.slice(0, 5).map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
          {tone.tags.length > 5 ? (
            <span className="text-[10px] text-brand-muted">+{tone.tags.length - 5}</span>
          ) : null}
        </div>
        <p className="mt-1 font-mono text-[11px] text-brand-muted tabular-nums">
          {tone.createdAt}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void (async () => {
              const ok = await toggleFavoriteRemote(tone.id, tone.favorite);
              if (ok) toggleFavoriteLocal(tone.id);
            })();
          }}
          className="rounded-md p-1.5 hover:bg-brand-border/40 transition-colors"
          aria-label={tone.favorite ? 'Remove favorite' : 'Add favorite'}
        >
          <Star
            size={16}
            className={
              tone.favorite
                ? 'text-brand-accent fill-brand-accent'
                : 'text-brand-subtext'
            }
          />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/tone/${tone.id}`);
          }}
          className="rounded-md p-1.5 text-brand-muted hover:bg-brand-border/40 hover:text-brand-accent transition-colors"
          aria-label="Tone details"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}
