import type { LucideIcon } from 'lucide-react';
import type { RefObject } from 'react';
import type { ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';

type FileDropRowProps = {
  inputId: string;
  sectionLabel: string;
  accept: string;
  Icon: LucideIcon;
  emptyCta: string;
  displayName: string;
  disabled: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  clearAriaLabel: string;
};

export default function FileDropRow({
  inputId,
  sectionLabel,
  accept,
  Icon,
  emptyCta,
  displayName,
  disabled,
  inputRef,
  onInputChange,
  onClear,
  clearAriaLabel,
}: FileDropRowProps) {
  const hasFile = displayName.length > 0;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-xs font-body font-semibold uppercase tracking-wide text-brand-subtext"
      >
        {sectionLabel}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={onInputChange}
      />
      {hasFile ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-brand-border bg-brand-card px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Icon
              size={18}
              className="shrink-0 text-brand-accent"
              aria-hidden
            />
            <span className="truncate font-mono text-sm text-brand-text">
              {displayName}
            </span>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={onClear}
            className="shrink-0 rounded-lg p-1.5 text-brand-muted transition-colors hover:bg-brand-border/50 hover:text-brand-text disabled:opacity-50"
            aria-label={clearAriaLabel}
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-border py-8 text-sm text-brand-muted transition-colors hover:border-brand-accent/40 ${disabled ? 'pointer-events-none opacity-50' : ''}`}
        >
          <Upload size={16} />
          {emptyCta}
        </label>
      )}
    </div>
  );
}
