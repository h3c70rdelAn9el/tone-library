import { X } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import TagBadge from './TagBadge';

type UploadTagFieldProps = {
  selectedTags: string[];
  tagInput: string;
  availableTags: string[];
  disabled: boolean;
  onTagInputChange: (value: string) => void;
  onTagInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onRemoveTag: (tag: string) => void;
  onToggleSuggestedTag: (tag: string) => void;
};

export default function UploadTagField({
  selectedTags,
  tagInput,
  availableTags,
  disabled,
  onTagInputChange,
  onTagInputKeyDown,
  onRemoveTag,
  onToggleSuggestedTag,
}: UploadTagFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-body font-semibold uppercase tracking-wide text-brand-subtext">
        Genre tags
      </label>
      {selectedTags.length > 0 ? (
        <div className="mb-1 flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <div key={tag} className="inline-flex items-center gap-1">
              <TagBadge tag={tag} />
              <button
                type="button"
                disabled={disabled}
                onClick={() => onRemoveTag(tag)}
                className="rounded p-0.5 text-brand-muted hover:text-brand-text disabled:opacity-50"
                aria-label={`Remove ${tag}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <input
        type="text"
        disabled={disabled}
        value={tagInput}
        onChange={(e) => onTagInputChange(e.target.value)}
        onKeyDown={onTagInputKeyDown}
        placeholder="Type a tag, press Enter or comma to add"
        className="rounded-xl border border-brand-border bg-brand-card px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted transition-colors focus:border-brand-accent/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 disabled:opacity-50"
      />
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => (
          <button
            type="button"
            key={tag}
            disabled={disabled}
            onClick={() => onToggleSuggestedTag(tag)}
            className={`rounded-full border px-4 py-2 font-body text-sm font-medium capitalize transition-all duration-200 disabled:opacity-50 ${
              selectedTags.includes(tag)
                ? 'border-brand-accent bg-brand-accent text-black shadow-[0_0_20px_-4px_rgba(232,255,71,0.45)]'
                : 'border-brand-border bg-brand-card/60 text-brand-subtext hover:border-brand-accent/35 hover:text-brand-text'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
