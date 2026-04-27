import { useState, type FormEvent } from 'react';
import type { GuitarType, PickupPosition, ToneCard } from '../types/tone';
import {
  recreateTone,
  type RecreateResult,
  type UserSetup,
} from '../lib/recreateTone';
import { X, Sparkles } from 'lucide-react';

const TUNING_OPTIONS = [
  { value: 'Standard', label: 'Standard (E A D G B E)' },
  { value: 'Eb Standard', label: 'Eb standard' },
  { value: 'Drop D', label: 'Drop D' },
  { value: 'Drop C', label: 'Drop C' },
  { value: 'DADGAD', label: 'DADGAD' },
  { value: 'Open G', label: 'Open G' },
];

const GUITAR_TYPES: { value: GuitarType; label: string }[] = [
  { value: 'single_coil', label: 'Single coil' },
  { value: 'humbucker', label: 'Humbucker' },
  { value: 'active', label: 'Active' },
];

/** Exact string from the tone when present; otherwise empty (user types or picks a hint). */
function initialTuningFromTone(t: ToneCard): string {
  return t.tuning?.trim() ?? '';
}

type RecreateSetupProps = {
  tone: ToneCard;
  onClose: () => void;
};

const inputClass =
  'rounded-xl border border-brand-border bg-brand-card px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/20';

export default function RecreateSetup({ tone, onClose }: RecreateSetupProps) {
  const [tuning, setTuning] = useState(() => initialTuningFromTone(tone));
  const [guitarType, setGuitarType] = useState<GuitarType | ''>(
    () => tone.guitarType ?? '',
  );
  const [pickupPosition, setPickupPosition] = useState<PickupPosition | ''>(
    () => tone.pickupPosition ?? '',
  );
  const [result, setResult] = useState<RecreateResult | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const setup: UserSetup = {
      tuning,
      guitarType: guitarType || undefined,
      pickupPosition: pickupPosition || undefined,
    };
    setResult(recreateTone(tone, setup));
  };

  const resetToForm = () => {
    setResult(null);
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recreate-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-brand-border bg-brand-surface shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-brand-border bg-brand-surface/95 px-5 py-4 backdrop-blur">
          <h2
            id="recreate-title"
            className="font-display-heading text-lg font-semibold text-brand-text"
          >
            Adapt tone
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-brand-muted hover:bg-brand-border/40 hover:text-brand-text"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          <p className="mb-4 text-sm text-brand-subtext">
            Adapt <span className="font-medium text-brand-text">{tone.name}</span>{' '}
            to your guitar. Rule-based hints only — no server calls. Values start from
            this tone when it has them; everything stays editable — nothing is locked to
            the card.
          </p>

          {!result ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="mb-4 text-xs text-brand-muted">
                Based on: {tone.name}
                {tone.tuning ? ` · Tuning: ${tone.tuning}` : ''}
                {tone.guitarType ? ` · ${tone.guitarType}` : ''}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="recreate-tuning"
                  className="text-xs font-semibold uppercase tracking-wide text-brand-subtext"
                >
                  Your tuning
                </label>
                <input
                  id="recreate-tuning"
                  list="recreate-tuning-presets"
                  value={tuning}
                  onChange={(e) => setTuning(e.target.value)}
                  placeholder="Type any tuning, or pick a hint below"
                  autoComplete="off"
                  className={inputClass}
                />
                <datalist id="recreate-tuning-presets">
                  {TUNING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} label={o.label} />
                  ))}
                </datalist>
                <p className="text-[11px] text-brand-muted">
                  Prefills from the tone when saved there; override to match your
                  instrument.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-subtext">
                  Your guitar type
                </span>
                <div className="flex flex-wrap gap-2">
                  {GUITAR_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setGuitarType(value)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        guitarType === value
                          ? 'border-brand-accent bg-brand-accent/15 text-brand-accent'
                          : 'border-brand-border bg-brand-card/60 text-brand-subtext hover:border-brand-accent/35'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <button
                    type="button"
                    onClick={() => setGuitarType('')}
                    className="text-[11px] text-brand-muted underline decoration-brand-border underline-offset-2 hover:text-brand-text"
                  >
                    Not sure — skip
                  </button>
                  <span className="text-[11px] text-brand-muted">
                    We still analyze; certainty takes a hit.
                  </span>
                </div>
                <p className="text-[11px] text-brand-muted">
                  Prefills from the tone when set; change to match what you are playing.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-brand-subtext">
                  Pickup position{' '}
                  <span className="font-normal normal-case text-brand-muted">
                    (optional)
                  </span>
                </label>
                <select
                  value={pickupPosition}
                  onChange={(e) =>
                    setPickupPosition((e.target.value || '') as PickupPosition | '')
                  }
                  className={inputClass}
                >
                  <option value="">—</option>
                  <option value="neck">Neck</option>
                  <option value="middle">Middle</option>
                  <option value="bridge">Bridge</option>
                </select>
                <p className="text-[11px] text-brand-muted">
                  Optional; prefills from the tone when set. Clear or change anytime.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button type="submit" className="btn-primary">
                  Analyze
                </button>
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <RecreateResultView result={result} onBack={resetToForm} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}

function RecreateResultView({
  result,
  onBack,
  onClose,
}: {
  result: RecreateResult;
  onBack: () => void;
  onClose: () => void;
}) {
  const hasAdjustments = result.adjustments.length > 0;
  const hasWarnings = result.warnings.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-2xl border border-brand-accent/25 bg-gradient-to-br from-brand-accent/[0.12] via-brand-card to-brand-surface/90 px-5 py-6">
        <Sparkles
          className="absolute right-4 top-4 h-8 w-8 text-brand-accent/35"
          aria-hidden
        />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
          Transfer likelihood
        </p>
        <p className="mt-1 font-display-heading text-5xl font-semibold tabular-nums leading-none text-brand-accent">
          {result.compatibility}
          <span className="text-2xl font-semibold text-brand-accent/80">%</span>
        </p>
        <p className="mb-2 mt-3 text-sm text-brand-muted">
          {result.compatibility > 80
            ? 'Very likely to translate well to your setup'
            : result.compatibility > 50
              ? 'Will need some adjustment'
              : 'Significant tone shift expected'}
        </p>
        <p className="mt-4 font-display text-base font-semibold text-brand-text">
          {result.confidence.label}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-brand-subtext">
          {result.confidence.blurb}
        </p>
      </div>

      <div className="space-y-4">
        {result.insights.map((line, i) => (
          <blockquote
            key={i}
            className="border-l-[3px] border-brand-accent/60 bg-brand-card/40 py-3 pl-4 pr-3 text-[15px] leading-relaxed text-brand-text"
          >
            {line}
          </blockquote>
        ))}
      </div>

      {hasAdjustments ? (
        <div className="rounded-xl border border-brand-border/80 bg-brand-card/30 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            First moves we would try
          </p>
          <ul className="mt-3 space-y-2.5 text-sm leading-snug text-brand-text">
            {result.adjustments.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm italic text-brand-subtext">
          No specific EQ moves flagged — your setup already lines up with the card.
        </p>
      )}

      {hasWarnings ? (
        <div
          className="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-4"
          role="status"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-200/90">
            Heads up
          </p>
          <ul className="mt-2.5 space-y-2 text-sm leading-relaxed text-amber-100/95">
            {result.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.notes.length > 0 ? (
        <div className="text-sm text-brand-muted">
          {result.notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-brand-border/60 pt-5">
        <button type="button" onClick={onBack} className="btn-secondary">
          Tweak setup
        </button>
        <button type="button" onClick={onClose} className="btn-primary">
          Done
        </button>
      </div>
    </div>
  );
}
