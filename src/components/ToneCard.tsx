import { useNavigate } from 'react-router-dom';
import { Star, FileAudio, Mic2 } from 'lucide-react';
import TagBadge from './TagBadge';
import clsx from 'clsx';
import type { Tone } from '../data/mockTones';

export default function ToneCard({ tone }: { tone: Tone }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/tone/${tone.id}`)}
      className={clsx(
        'group cursor-pointer rounded-2xl border border-brand-border bg-brand-card p-5',
        'hover:border-brand-accent/50 hover:bg-brand-surface transition-all duration-200',
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-display text-xl font-semibold text-brand-text tracking-tight leading-snug group-hover:text-brand-accent transition-colors">
          {tone.name}
        </h3>
        {tone.favorite && (
          <Star
            size={14}
            className="text-brand-accent fill-brand-accent shrink-0 mt-1 ml-2"
          />
        )}
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
