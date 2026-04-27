import type { GuitarType, PickupPosition, PlayStyle, ToneCard } from '../types/tone';

export type UserSetup = {
  tuning: string;
  guitarType?: GuitarType;
  pickupPosition?: PickupPosition;
  playStyle?: PlayStyle;
  context?: string;
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
  suggestedTone?: Partial<ToneCard>;
};

function normTuning(s: string): string {
  return s.trim().toLowerCase();
}

function clampKnob(n: number): number {
  return Math.min(10, Math.max(0, n));
}

function isDropC(setupTuning: string): boolean {
  return normTuning(setupTuning).replace(/\s+/g, '') === 'dropc';
}

function buildConfidence(compatibility: number, missingUserGuitar: boolean): RecreateConfidence {
  let label: string;
  let blurb: string;

  if (compatibility >= 85) {
    label = 'Strong read';
    blurb = 'Most signals line up — minimal adjustment needed.';
  } else if (compatibility >= 65) {
    label = 'Solid guess';
    blurb = 'Close match — small EQ and gain tweaks expected.';
  } else if (compatibility >= 45) {
    label = 'Soft call';
    blurb = 'Moderate mismatch — expect tonal shaping.';
  } else {
    label = 'Rough sketch';
    blurb = 'This is a reinterpretation, not a copy.';
  }

  if (missingUserGuitar) {
    blurb += ' Pickup type is unknown, lowering certainty.';
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
    lines.push('Pickup type unknown — gain accuracy reduced.');
  }

  if (flags.tightnessLowEnd) {
    lines.push('This tone will feel tighter than expected in your setup.');
  } else if (flags.tuningMismatch) {
    lines.push('Tuning mismatch will affect low-end response.');
  } else if (flags.guitarMismatch) {
    lines.push('Pickup mismatch may shift gain character.');
  }

  if (flags.noiseSingleCoil) {
    lines.push('Single coils will reveal more noise than expected.');
  }

  if (lines.length === 0) {
    lines.push('Close match — small EQ moves matter most.');
  }

  return lines.slice(0, 2);
}

export function recreateTone(tone: ToneCard, setup: UserSetup): RecreateResult {
  let score = 100;

  const adjustments: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];

  const missingGuitar = !setup.guitarType;

  let tuningMismatch = false;
  let guitarMismatch = false;
  let tightnessLowEnd = false;
  let noiseSingleCoil = false;
  let styleMismatch = false;

  if (missingGuitar) {
    score -= 15;
    warnings.push('Missing guitar type reduces accuracy');
  }

  if (tone.tuning && normTuning(tone.tuning) !== normTuning(setup.tuning)) {
    tuningMismatch = true;
    score -= 25;
    adjustments.push('Adjust low-end EQ slightly');
    warnings.push(`Tone was designed for ${tone.tuning}`);
  }

  if (tone.guitarType && setup.guitarType && tone.guitarType !== setup.guitarType) {
    guitarMismatch = true;
    score -= 30;
    adjustments.push('Adjust gain and EQ for pickup type');
    warnings.push(`Optimized for ${tone.guitarType.replace(/_/g, ' ')}`);
  }

  if (tone.noiseLevel != null && tone.noiseLevel > 7 && setup.guitarType === 'single_coil') {
    noiseSingleCoil = true;
    warnings.push('Higher noise expected with single coils');
  }

  if (tone.tightness != null && tone.tightness > 7 && !isDropC(setup.tuning)) {
    tightnessLowEnd = true;
    adjustments.push('Reduce low-end slightly for clarity');
  }

  if (setup.playStyle && tone.playStyle && setup.playStyle !== tone.playStyle) {
    styleMismatch = true;
    score -= 10;
    adjustments.push(
      'Rebalance gain and EQ for your chosen role vs how this tone was tagged',
    );
    warnings.push(`Tone is tagged ${tone.playStyle}; you chose ${setup.playStyle}`);
  }

  if (setup.playStyle === 'clean' && tone.gain != null && tone.gain >= 6) {
    score -= 5;
    adjustments.push('Reduce gain for cleaner response');
  }

  if (setup.playStyle === 'lead' && tone.gain != null && tone.gain <= 4) {
    score -= 5;
    adjustments.push('Increase gain for sustain');
  }

  const contextTrim = setup.context?.trim() ?? '';
  if (contextTrim) {
    const excerpt = contextTrim.slice(0, 400);
    notes.push(`Setup note: ${excerpt}${contextTrim.length > 400 ? '…' : ''}`);
  }
  if (/\b(bedroom|apartment|quiet|headphones)\b/i.test(contextTrim)) {
    adjustments.push(
      'At home volume, tones often read darker — nudge treble if it feels closed off.',
    );
  }
  if (/\b(live|stage|gig)\b/i.test(contextTrim)) {
    adjustments.push(
      'Live level can make gain feel hotter — keep master and feedback in mind.',
    );
  }

  const compatibility = Math.max(0, score);

  let insights = buildInsights({
    missingUserGuitar: missingGuitar,
    tuningMismatch,
    guitarMismatch,
    tightnessLowEnd,
    noiseSingleCoil,
  });

  if (styleMismatch) {
    insights = [
      'You are aiming for a different musical role than the reference — expect to rebalance EQ and gain, not copy knobs 1:1.',
      ...insights,
    ].slice(0, 2);
  } else if (
    setup.playStyle === 'clean' &&
    tone.gain != null &&
    tone.gain >= 6
  ) {
    insights = [
      'Clean intent on a gain-heavy patch usually means less drive and a gentler top end — let the amp breathe.',
      ...insights,
    ].slice(0, 2);
  } else if (
    setup.playStyle === 'lead' &&
    tone.gain != null &&
    tone.gain <= 4
  ) {
    insights = [
      'Lead playing on a leaner patch often wants a hair more sustain and mid forwardness — small moves go far.',
      ...insights,
    ].slice(0, 2);
  }

  const confidence = buildConfidence(compatibility, missingGuitar);

  // base suggested tone (safe copy)
  const suggestedTone: Partial<ToneCard> = {
    gain: tone.gain,
    bass: tone.bass,
    mid: tone.mid,
    treble: tone.treble,
  };

  let touched = false;

  const apply = (
    key: 'gain' | 'bass' | 'mid' | 'treble',
    value: number | null | undefined,
    delta = 0,
  ) => {
    if (value == null) return;
    const next = clampKnob(value + delta);
    suggestedTone[key] = next;
    touched = true;
  };

  if (tuningMismatch) apply('bass', tone.bass, -0.5);
  if (guitarMismatch) apply('gain', tone.gain, +0.5);
  if (tone.tightness != null && tone.tightness > 7) apply('mid', tone.mid, +0.5);

  if (setup.playStyle === 'clean' && tone.gain != null && tone.gain >= 6) {
    apply('gain', tone.gain, -1);
    apply('treble', tone.treble, -0.5);
  }

  if (setup.playStyle === 'lead' && tone.gain != null && tone.gain <= 4) {
    apply('gain', tone.gain, +0.5);
    apply('mid', tone.mid, +0.5);
  }

  return {
    compatibility,
    adjustments,
    warnings,
    notes,
    insights,
    confidence,
    suggestedTone: touched ? suggestedTone : undefined,
  };
}
