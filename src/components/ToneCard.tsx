import { useNavigate } from 'react-router-dom';
import { Star, FileAudio, Mic2 } from 'lucide-react';
import TagBadge from './TagBadge';
import clsx from 'clsx';
import type { Tone } from '../types/tone';
import { useToneStore } from '../store/useToneStore';

export default function ToneCard({ tone }: { tone: Tone }) {
  const navigate = useNavigate();
  const toggleFavorite = useToneStore((s) => s.toggleFavorite);

  return (
    <div
      onClick={() => navigate(`/tone/${tone.id}`)}
      className={clsx(
        'group cursor-pointer rounded-2xl border border-brand-border bg-brand-card p-5',
        'hover:border-brand-accent/50 hover:bg-brand-surface transition-all duration-200',
      )}
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        <h3 className="font-display text-xl font-semibold text-brand-text tracking-tight leading-snug group-hover:text-brand-accent transition-colors min-w-0">
          {tone.name}
        </h3>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(tone.id);
          }}
          className="shrink-0 p-0.5 rounded-md hover:bg-brand-border/40 transition-colors"
          aria-label={tone.favorite ? 'Remove favorite' : 'Add favorite'}
        >
          <Star
            size={14}
            className={
              tone.favorite
                ? 'text-brand-accent fill-brand-accent'
                : 'text-brand-subtext'
            }
          />
        </button>
      </div>

      <p className="text-brand-subtext text-sm leading-relaxed mb-4 line-clamp-2">
        {tone.notes}
      </p>

      <div className="flex flex-col gap-1 mb-4">
        {tone.namFile && (
          <div className="flex items-center gap-2 text-xs text-brand-muted font-body tabular-nums">
            <FileAudio size={11} />
            {tone.namFile}
          </div>
        )}
        {tone.irFile && (
          <div className="flex items-center gap-2 text-xs text-brand-muted font-body tabular-nums">
            <Mic2 size={11} />
            {tone.irFile}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tone.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>
    </div>
  );
}
