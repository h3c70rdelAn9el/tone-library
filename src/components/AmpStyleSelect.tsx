import type { AmpStyle } from '../types/tone';
import { AMP_STYLE_OPTIONS } from '../lib/toneForm';

type AmpStyleSelectProps = {
  id?: string;
  value: AmpStyle;
  disabled?: boolean;
  onChange: (value: AmpStyle) => void;
};

export default function AmpStyleSelect({
  id = 'amp-style-select',
  value,
  disabled,
  onChange,
}: AmpStyleSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-body font-semibold uppercase tracking-wide text-brand-subtext"
      >
        Amp Style
      </label>
      <select
        id={id}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value as AmpStyle)}
        className="rounded-xl border border-brand-border bg-brand-card px-4 py-2.5 text-sm text-brand-text transition-colors focus:border-brand-accent/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 disabled:opacity-50"
      >
        {AMP_STYLE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <p className="text-[11px] text-brand-muted">
        Cosmetic look for the amp display. Optional — defaults to Modern.
      </p>
    </div>
  );
}
