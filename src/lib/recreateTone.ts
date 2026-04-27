import type { GuitarType, PickupPosition, ToneCard } from '../types/tone';

export type UserSetup = {
  tuning: string;
  guitarType: GuitarType;
  pickupPosition?: PickupPosition;
};

export type RecreateResult = {
  compatibility: number;
  adjustments: string[];
  warnings: string[];
  notes: string[];
};

function normTuning(s: string): string {
  return s.trim().toLowerCase();
}

/** Doc rule uses "Drop C" for tightness; treat common variants the same. */
function isDropC(setupTuning: string): boolean {
  return normTuning(setupTuning).replace(/\s+/g, '') === 'dropc';
}

export function recreateTone(tone: ToneCard, setup: UserSetup): RecreateResult {
  let score = 100;

  const adjustments: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];

  if (
    tone.tuning &&
    normTuning(tone.tuning) !== normTuning(setup.tuning)
  ) {
    score -= 25;
    adjustments.push('Adjust low-end EQ slightly');
    warnings.push(`Tone was designed for ${tone.tuning}`);
  }

  if (tone.guitarType && tone.guitarType !== setup.guitarType) {
    score -= 30;
    adjustments.push('Adjust gain and EQ for pickup type difference');
    warnings.push(`Optimized for ${tone.guitarType.replace(/_/g, ' ')}`);
  }

  if (
    tone.noiseLevel != null &&
    tone.noiseLevel > 7 &&
    setup.guitarType === 'single_coil'
  ) {
    warnings.push('Higher noise floor expected with single coils');
  }

  if (
    tone.tightness != null &&
    tone.tightness > 7 &&
    !isDropC(setup.tuning)
  ) {
    adjustments.push('Reduce low-end slightly for clarity');
  }

  return {
    compatibility: Math.max(0, score),
    adjustments,
    warnings,
    notes,
  };
}
