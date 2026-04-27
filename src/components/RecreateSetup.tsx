import { useMemo, useState, type FormEvent } from 'react';
import type { GuitarType, PickupPosition, ToneCard } from '../types/tone';
import {
  recreateTone,
  type RecreateResult,
  type UserSetup,
} from '../lib/recreateTone';
import { X } from 'lucide-react';

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

function resolveInitialTuning(t: ToneCard): string {
  const raw = t.tuning?.trim();
  if (!raw) return TUNING_OPTIONS[0].value;
  const match = TUNING_OPTIONS.find(
    (o) => o.value.toLowerCase() === raw.toLowerCase(),
  );
  return match ? match.value : raw;
}

function buildTuningSelectOptions(tone: ToneCard) {
  const raw = tone.tuning?.trim();
  if (!raw) return TUNING_OPTIONS;
  const inPreset = TUNING_OPTIONS.some(
    (o) => o.value.toLowerCase() === raw.toLowerCase(),
  );
  if (inPreset) return TUNING_OPTIONS;
  return [
    { value: raw, label: `${raw} (from tone)` },
    ...TUNING_OPTIONS,
  ];
}

type RecreateSetupProps = {
  tone: ToneCard;
  onClose: () => void;
};

export default function RecreateSetup({ tone, onClose }: RecreateSetupProps) {
  const [tuning, setTuning] = useState(() => resolveInitialTuning(tone));
  const [guitarType, setGuitarType] = useState<GuitarType>(
    () => tone.guitarType ?? 'humbucker',
  );
  const [pickupPosition, setPickupPosition] = useState<PickupPosition | ''>(
    () => tone.pickupPosition ?? '',
  );
  const [result, setResult] = useState<RecreateResult | null>(null);

  const tuningOptions = useMemo(() => buildTuningSelectOptions(tone), [tone.tuning]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const setup: UserSetup = {
      tuning,
      guitarType,
      pickupPosition: pickupPosition || undefined,
    };
    setResult(recreateTone(tone, setup));
  };

  const resetToForm = () => setResult(null);

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
            Recreate tone
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
            to your guitar. Rule-based hints only — no server calls. Fields use this
            tone’s setup when present; change anything that differs on your rig.
          </p>

          {!result ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-brand-subtext">
                  Tuning
                </label>
                <select
                  value={tuning}
                  onChange={(e) => setTuning(e.target.value)}
                  className="rounded-xl border border-brand-border bg-brand-card px-4 py-2.5 text-sm text-brand-text focus:border-brand-accent/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                >
                  {tuningOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-subtext">
                  Guitar type
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
                  className="rounded-xl border border-brand-border bg-brand-card px-4 py-2.5 text-sm text-brand-text focus:border-brand-accent/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                >
                  <option value="">—</option>
                  <option value="neck">Neck</option>
                  <option value="middle">Middle</option>
                  <option value="bridge">Bridge</option>
                </select>
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
            <div className="flex flex-col gap-6">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                  Compatibility
                </p>
                <p className="font-display-heading text-4xl font-semibold tabular-nums text-brand-accent">
                  {result.compatibility}%
                </p>
              </div>

              <ResultSection title="Adjustments" items={result.adjustments} />
              <ResultSection title="Warnings" items={result.warnings} />
              <ResultSection title="Notes" items={result.notes} emptyHint="None" />

              <div className="flex flex-wrap gap-3 pt-2">
                <button type="button" onClick={resetToForm} className="btn-secondary">
                  Adjust setup
                </button>
                <button type="button" onClick={onClose} className="btn-primary">
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultSection({
  title,
  items,
  emptyHint,
}: {
  title: string;
  items: string[];
  emptyHint?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-muted">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-brand-muted">{emptyHint ?? '—'}</p>
      ) : (
        <ul className="list-inside list-disc space-y-1 text-sm text-brand-text">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
