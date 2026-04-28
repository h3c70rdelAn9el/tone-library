import { useState, type FormEvent } from 'react';
import type {
  PickupPosition,
  PickupType,
  PlayStyle,
  ToneCard,
} from '../types/tone';
import { formatPickupLabel } from '../lib/pickupLabels';
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

const PICKUP_TYPES: { value: PickupType; label: string }[] = [
  { value: 'single_coil', label: 'Single coil' },
  { value: 'humbucker', label: 'Humbucker' },
];

const PLAY_STYLES: { value: PlayStyle; label: string }[] = [
  { value: 'rhythm', label: 'Rhythm' },
  { value: 'lead', label: 'Lead' },
  { value: 'ambient', label: 'Ambient' },
  { value: 'clean', label: 'Clean' },
];

/** Exact string from the tone when present; otherwise empty (user types or picks a hint). */
function initialTuningFromTone(t: ToneCard): string {
  return t.tuning?.trim() ?? '';
}

type RecreateSetupProps = {
  tone: ToneCard;
  onClose: () => void;
};

type RecreateStep = 'setup' | 'result';

const inputClass =
  'rounded-xl border border-brand-border bg-brand-card px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/20';

/** Highlight when both values are known numbers and they differ (per docs/07). */
function knobsDiffer(
  a: number | null | undefined,
  b: number | null | undefined,
): boolean {
  if (a == null || b == null) return false;
  return a !== b;
}

export default function RecreateSetup({ tone, onClose }: RecreateSetupProps) {
  const [tuning, setTuning] = useState(() => initialTuningFromTone(tone));
  const [pickupType, setPickupType] = useState<PickupType | ''>(
    () => tone.pickupType ?? '',
  );
  const [activePickups, setActivePickups] = useState(
    () => tone.activePickups === true,
  );
  const [pickupPosition, setPickupPosition] = useState<PickupPosition | ''>(
    () => tone.pickupPosition ?? '',
  );
  const [playStyle, setPlayStyle] = useState<PlayStyle | ''>(
    () => tone.playStyle ?? '',
  );
  const [context, setContext] = useState('');
  const [step, setStep] = useState<RecreateStep>('setup');
  const [result, setResult] = useState<RecreateResult | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const setup: UserSetup = {
      tuning,
      pickupType: pickupType || undefined,
      activePickups: pickupType ? activePickups : undefined,
      pickupPosition: pickupPosition || undefined,
      playStyle: playStyle || undefined,
      context: context.trim() || undefined,
    };
    setResult(recreateTone(tone, setup));
    setStep('result');
  };

  /** Refine loop: back to setup with inputs untouched; analyze again to refresh. */
  const handleRefineSetup = () => {
    setStep('setup');
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
            this tone when it has them; pick a play style so the readout matches how you
            will use the sound. Everything stays editable — nothing is locked to the
            card.
          </p>

          {step === 'setup' ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {result !== null ? (
                <p className="mb-1 rounded-lg border border-brand-accent/25 bg-brand-accent/[0.08] px-3 py-2.5 text-xs leading-snug text-brand-subtext">
                  Adjust your setup below, then tap{' '}
                  <span className="font-semibold text-brand-text">Analyze</span> again
                  to refresh the readout — your fields stay as you left them.
                </p>
              ) : null}

              <div className="mb-4 text-xs text-brand-muted">
                Based on: {tone.name}
                {tone.tuning ? ` · Tuning: ${tone.tuning}` : ''}
                {tone.pickupType
                  ? ` · ${formatPickupLabel(tone.pickupType, tone.activePickups)}`
                  : ''}
                {tone.playStyle
                  ? ` · ${PLAY_STYLES.find((p) => p.value === tone.playStyle)?.label ?? tone.playStyle}`
                  : ''}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-subtext">
                  Your play style
                </span>
                <div className="flex flex-wrap gap-2">
                  {PLAY_STYLES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPlayStyle(value)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        playStyle === value
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
                    onClick={() => setPlayStyle('')}
                    className="text-[11px] text-brand-muted underline decoration-brand-border underline-offset-2 hover:text-brand-text"
                  >
                    Clear — no style hint
                  </button>
                  <span className="text-[11px] text-brand-muted">
                    Prefills from the tone when tagged; helps role vs gain hints.
                  </span>
                </div>
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
                  Your pickup type
                </span>
                <div className="flex flex-wrap gap-2">
                  {PICKUP_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPickupType(value)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        pickupType === value
                          ? 'border-brand-accent bg-brand-accent/15 text-brand-accent'
                          : 'border-brand-border bg-brand-card/60 text-brand-subtext hover:border-brand-accent/35'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <label
                  className={`flex cursor-pointer items-center gap-2 text-sm ${
                    pickupType ? 'text-brand-subtext' : 'text-brand-muted'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={activePickups}
                    disabled={!pickupType}
                    onChange={(e) => setActivePickups(e.target.checked)}
                    className="h-4 w-4 rounded border-brand-border bg-brand-card text-brand-accent focus:ring-brand-accent/30"
                  />
                  Active pickups (works with single coil or humbucker)
                </label>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPickupType('');
                      setActivePickups(false);
                    }}
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

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="recreate-context"
                  className="text-xs font-semibold uppercase tracking-wide text-brand-subtext"
                >
                  Your context{' '}
                  <span className="font-normal normal-case text-brand-muted">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="recreate-context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Amp model, room, part you’re playing, gig vs bedroom, anything that changes how this should read…"
                  rows={3}
                  maxLength={500}
                  className={`${inputClass} min-h-[88px] resize-y`}
                />
                <p className="text-[11px] text-brand-muted">
                  Shown back in results; a few plain words (e.g. bedroom, live, quiet)
                  nudge the hint list.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button type="submit" className="btn-primary">
                  {result !== null ? 'Analyze again' : 'Analyze'}
                </button>
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          ) : result ? (
            <RecreateResultView
              tone={tone}
              result={result}
              onRefineSetup={handleRefineSetup}
              onClose={onClose}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function RecreateResultView({
  tone,
  result,
  onRefineSetup,
  onClose,
}: {
  tone: ToneCard;
  result: RecreateResult;
  onRefineSetup: () => void;
  onClose: () => void;
}) {
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
        <p className="mb-3 mt-3 text-sm text-brand-muted">
          {result.compatibility > 80
            ? 'This tone should translate closely to your setup.'
            : result.compatibility > 50
              ? 'This tone will change character but remain usable.'
              : 'This tone will behave significantly differently in your setup.'}
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

      <div className="mb-4">
        <p className="mb-2 text-xs uppercase text-brand-muted">Adjustments</p>
        <ul className="space-y-1 text-sm text-brand-text">
          {result.adjustments.length === 0 ? (
            <li className="text-brand-muted">—</li>
          ) : (
            result.adjustments.map((a, i) => (
              <li key={`${a}-${i}`}>
                • {a}
              </li>
            ))
          )}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase text-brand-muted">Warnings</p>
        <ul
          className={`space-y-1 text-sm ${result.warnings.length === 0 ? 'text-brand-muted' : 'text-red-300/80'}`}
        >
          {result.warnings.length === 0 ? (
            <li>—</li>
          ) : (
            result.warnings.map((w, i) => (
              <li key={`${w}-${i}`}>
                • {w}
              </li>
            ))
          )}
        </ul>
      </div>

      {result.suggestedTone ? (
        <div className="mt-6 rounded-2xl border border-brand-border bg-brand-card p-5">
          <p className="mb-2 text-xs uppercase text-brand-muted">
            A / B Comparison
          </p>
          <p className="mb-4 text-xs text-brand-subtext">
            What changes if you play this in your setup — same 0–10 scale as your
            library. Yellow marks a changed knob.
          </p>

          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="mb-2 text-brand-muted">Original</p>
              <div className="space-y-1">
                <div
                  className={
                    knobsDiffer(tone.gain, result.suggestedTone.gain)
                      ? 'font-medium tabular-nums text-yellow-400'
                      : 'tabular-nums text-brand-text'
                  }
                >
                  Gain: {tone.gain ?? '—'}
                </div>
                <div
                  className={
                    knobsDiffer(tone.bass, result.suggestedTone.bass)
                      ? 'font-medium tabular-nums text-yellow-400'
                      : 'tabular-nums text-brand-text'
                  }
                >
                  Bass: {tone.bass ?? '—'}
                </div>
                <div
                  className={
                    knobsDiffer(tone.mid, result.suggestedTone.mid)
                      ? 'font-medium tabular-nums text-yellow-400'
                      : 'tabular-nums text-brand-text'
                  }
                >
                  Mid: {tone.mid ?? '—'}
                </div>
                <div
                  className={
                    knobsDiffer(tone.treble, result.suggestedTone.treble)
                      ? 'font-medium tabular-nums text-yellow-400'
                      : 'tabular-nums text-brand-text'
                  }
                >
                  Treble: {tone.treble ?? '—'}
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-brand-accent">Adapted</p>
              <div className="space-y-1">
                <div
                  className={
                    knobsDiffer(tone.gain, result.suggestedTone.gain)
                      ? 'font-medium tabular-nums text-yellow-400'
                      : 'tabular-nums text-brand-text'
                  }
                >
                  Gain:{' '}
                  {result.suggestedTone.gain ?? tone.gain ?? '—'}
                </div>
                <div
                  className={
                    knobsDiffer(tone.bass, result.suggestedTone.bass)
                      ? 'font-medium tabular-nums text-yellow-400'
                      : 'tabular-nums text-brand-text'
                  }
                >
                  Bass:{' '}
                  {result.suggestedTone.bass ?? tone.bass ?? '—'}
                </div>
                <div
                  className={
                    knobsDiffer(tone.mid, result.suggestedTone.mid)
                      ? 'font-medium tabular-nums text-yellow-400'
                      : 'tabular-nums text-brand-text'
                  }
                >
                  Mid:{' '}
                  {result.suggestedTone.mid ?? tone.mid ?? '—'}
                </div>
                <div
                  className={
                    knobsDiffer(tone.treble, result.suggestedTone.treble)
                      ? 'font-medium tabular-nums text-yellow-400'
                      : 'tabular-nums text-brand-text'
                  }
                >
                  Treble:{' '}
                  {result.suggestedTone.treble ?? tone.treble ?? '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {result.notes.length > 0 ? (
        <div className="text-sm text-brand-muted">
          {result.notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-brand-border/60 pt-5">
        <button
          type="button"
          onClick={onRefineSetup}
          className="btn-secondary"
        >
          Refine setup →
        </button>
        <button type="button" onClick={onClose} className="btn-primary">
          Done
        </button>
      </div>
    </div>
  );
}
