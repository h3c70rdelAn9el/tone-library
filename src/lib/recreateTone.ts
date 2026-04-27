import type { GuitarType, PickupPosition, ToneCard } from '../types/tone';

export type UserSetup = {
  tuning: string;
  /** Omit or leave unset if unknown — analysis still runs with lower certainty. */
  guitarType?: GuitarType;
  pickupPosition?: PickupPosition;
};

export type RecreateConfidence = {
  label: string;
  blurb: string;
};

export type RecreateResult = {
  compatibility: number;
  adjustments: string[];
  warnings: string[];
  notes: string[];
  insights: string[];
  confidence: RecreateConfidence;
};

function normTuning(s: string): string {
  return s.trim().toLowerCase();
}

/** Doc rule uses "Drop C" for tightness; treat common variants the same. */
function isDropC(setupTuning: string): boolean {
  return normTuning(setupTuning).replace(/\s+/g, '') === 'dropc';
}

function buildConfidence(
  compatibility: number,
  missingUserGuitar: boolean,
): RecreateConfidence {
  let label: string;
  let blurb: string;

  if (compatibility >= 85) {
    label = 'Strong read';
    blurb =
      'Most signals line up — you should not need heroic tweaks to get in the ballpark.';
  } else if (compatibility >= 65) {
    label = 'Solid guess';
    blurb =
      'You are in the neighborhood; a few intentional moves should close the gap.';
  } else if (compatibility >= 45) {
    label = 'Soft call';
    blurb =
      'Several things are working against a one-to-one copy — trust your ears more than the number.';
  } else {
    label = 'Rough sketch';
    blurb =
      'Treat this as a starting mood, not a recipe — budget extra time to dial it in.';
  }

  if (missingUserGuitar) {
    blurb = `${blurb} We are filling in pickup type blind — that pulls certainty down a notch.`;
  }

  return { label, blurb };
}

function buildInsights(flags: {
  missingUserGuitar: boolean;
  tuningMismatch: boolean;
  guitarMismatch: boolean;
  tightnessLowEnd: boolean;
  noiseSingleCoil: boolean;
}): string[] {
  const lines: string[] = [];

  if (flags.missingUserGuitar) {
    lines.push(
      'Without your pickup type we cannot judge gain staging as precisely — expect a little more trial and error.',
    );
  }

  if (flags.tightnessLowEnd) {
    lines.push('This tone will feel tighter than expected in your setup.');
  } else if (flags.tuningMismatch) {
    lines.push(
      'The low strings will not respond quite like the reference — a touch less low-end clutter usually sells the illusion.',
    );
  } else if (flags.guitarMismatch) {
    lines.push(
      'On your pickups this may read hotter or woodier than the original; ride volume and tone until it sits.',
    );
  }

  if (lines.length >= 2) {
    return lines.slice(0, 2);
  }

  if (flags.noiseSingleCoil && lines.length < 2) {
    lines.push(
      'Single coils will expose the noise floor this patch was built around — that is normal, not a broken preset.',
    );
  }

  if (lines.length === 0) {
    lines.push(
      'You are close to a straight transfer — small EQ moves will matter more than big gain swings.',
    );
  }

  return lines.slice(0, 2);
}

export function recreateTone(tone: ToneCard, setup: UserSetup): RecreateResult {
  let score = 100;

  const adjustments: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];

  const userGuitarMissing = setup.guitarType == null;

  let tuningMismatch = false;
  let guitarMismatch = false;
  let tightnessLowEnd = false;
  let noiseSingleCoil = false;

  if (userGuitarMissing) {
    score -= 15;
    warnings.push('Missing guitar type reduces accuracy');
  }

  if (
    tone.tuning &&
    normTuning(tone.tuning) !== normTuning(setup.tuning)
  ) {
    tuningMismatch = true;
    score -= 25;
    adjustments.push('Adjust low-end EQ slightly');
    warnings.push(`Tone was designed for ${tone.tuning}`);
  }

  if (
    tone.guitarType &&
    setup.guitarType &&
    tone.guitarType !== setup.guitarType
  ) {
    guitarMismatch = true;
    score -= 30;
    adjustments.push('Adjust gain and EQ for pickup type difference');
    warnings.push(`Optimized for ${tone.guitarType.replace(/_/g, ' ')}`);
  }

  if (
    tone.noiseLevel != null &&
    tone.noiseLevel > 7 &&
    setup.guitarType === 'single_coil'
  ) {
    noiseSingleCoil = true;
    warnings.push('Higher noise floor expected with single coils');
  }

  if (
    tone.tightness != null &&
    tone.tightness > 7 &&
    !isDropC(setup.tuning)
  ) {
    tightnessLowEnd = true;
    adjustments.push('Reduce low-end slightly for clarity');
  }

  const compatibility = Math.max(0, score);

  const insights = buildInsights({
    missingUserGuitar: userGuitarMissing,
    tuningMismatch,
    guitarMismatch,
    tightnessLowEnd,
    noiseSingleCoil,
  });

  const confidence = buildConfidence(compatibility, userGuitarMissing);

  return {
    compatibility,
    adjustments,
    warnings,
    notes,
    insights,
    confidence,
  };
}
