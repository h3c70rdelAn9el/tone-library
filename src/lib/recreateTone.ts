import type { PickupPosition, PickupType, PlayStyle, ToneCard } from '../types/tone';

export type UserSetup = {
  tuning: string;
  pickupType?: PickupType;
  /** Matches ToneCard: active electronics (either coil family). */
  activePickups?: boolean;
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

/** Text from the card used for light genre / intent matching (not the user note). */
function toneCardText(t: ToneCard): string {
  return [t.name, t.description, t.mixNotes, ...t.genreTags].filter(Boolean).join(' ');
}

/** Coarse style buckets for rule-based matching (context + card + gain). */
type StyleCluster =
  | 'high_gain'
  | 'clean_platform'
  | 'blues_roots'
  | 'funk_soul'
  | 'country_folk'
  | 'jazz_ambient';

const STYLE_SIGNALS: { cluster: StyleCluster; re: RegExp }[] = [
  {
    cluster: 'high_gain',
    re: /\b(metal|djent|chug|chugs|death|thrash|grindcore|deathcore|brutal|meshuggah|high[\s-]*gain|recto|5150|6505|mesa)\b/i,
  },
  {
    cluster: 'clean_platform',
    re: /\b(clean|glassy|chime|sparkle|shimmer|pedal\s*platform|edge\s*of\s*break|pristine|chimey)\b/i,
  },
  {
    cluster: 'blues_roots',
    re: /\b(blues|srv|b\.?\s*b\.?\s*king|southern\s*rock|roots|slide|zeppelin|hendrix|gilmour)\b/i,
  },
  {
    cluster: 'funk_soul',
    re: /\b(funk|motown|disco|neo[\s-]*soul|rnb|r&b)\b/i,
  },
  {
    cluster: 'country_folk',
    re: /\b(country|bluegrass|twang|nashville|honky|americana)\b/i,
  },
  {
    cluster: 'jazz_ambient',
    re: /\b(jazz|bebop|bossa|ambient(?!metal)|fusion(?!\s*metal))\b/i,
  },
];

/** Strat / tele are strong clean-role cues when paired with low gain (see bias below). */
const STRAT_TELE_RE =
  /\b(strat|stratocaster|tele|telecaster|single[\s-]*coil\s*clean)\b/i;

/** Pairs that should not align without a big reinterpretation (symmetric). */
const STYLE_CLASH_PAIRS: [StyleCluster, StyleCluster][] = [
  ['high_gain', 'clean_platform'],
  ['high_gain', 'jazz_ambient'],
  ['high_gain', 'country_folk'],
  ['high_gain', 'funk_soul'],
  ['high_gain', 'blues_roots'],
];

const SOFT_STYLE_CLUSTERS = new Set<StyleCluster>([
  'clean_platform',
  'jazz_ambient',
  'country_folk',
  'funk_soul',
  'blues_roots',
]);

function extractStyleClusters(text: string): Set<StyleCluster> {
  const out = new Set<StyleCluster>();
  for (const { cluster, re } of STYLE_SIGNALS) {
    if (re.test(text)) out.add(cluster);
  }
  return out;
}

function styleSetsIntersect(a: Set<StyleCluster>, b: Set<StyleCluster>): boolean {
  for (const x of a) {
    if (b.has(x)) return true;
  }
  return false;
}

function userStyleIntentContradiction(s: Set<StyleCluster>): boolean {
  return s.has('high_gain') && s.has('clean_platform');
}

function toneStyleIntentContradiction(s: Set<StyleCluster>): boolean {
  return s.has('high_gain') && s.has('clean_platform');
}

/** Style clusters from the user's free-text note only (play-style chips use separate rules). */
function buildUserStyleClusters(contextTrim: string): Set<StyleCluster> {
  return extractStyleClusters(contextTrim);
}

function buildToneStyleClusters(tone: ToneCard): Set<StyleCluster> {
  const s = extractStyleClusters(toneCardText(tone));
  if (tone.gain != null && tone.gain >= 6) s.add('high_gain');
  if (tone.gain != null && tone.gain <= 4) s.add('clean_platform');
  if (STRAT_TELE_RE.test(toneCardText(tone)) && (tone.gain == null || tone.gain <= 5)) {
    s.add('clean_platform');
  }
  if (tone.playStyle === 'clean') s.add('clean_platform');
  if (tone.playStyle === 'ambient') s.add('jazz_ambient');
  return s;
}

function styleClashHit(user: Set<StyleCluster>, tone: Set<StyleCluster>): boolean {
  for (const [x, y] of STYLE_CLASH_PAIRS) {
    if ((user.has(x) && tone.has(y)) || (user.has(y) && tone.has(x))) return true;
  }
  return false;
}

type StyleGoalMismatch = 'user_heavy_tone_soft' | 'user_soft_tone_heavy';

function resolveStyleGoalMismatch(
  user: Set<StyleCluster>,
  tone: Set<StyleCluster>,
): StyleGoalMismatch | null {
  if (user.size === 0 || tone.size === 0) return null;
  if (userStyleIntentContradiction(user)) return null;
  if (toneStyleIntentContradiction(tone)) return null;
  if (styleSetsIntersect(user, tone)) return null;
  if (!styleClashHit(user, tone)) return null;

  const userHeavy = user.has('high_gain');
  const toneHeavy = tone.has('high_gain');
  const userSoftish = [...user].some((c) => SOFT_STYLE_CLUSTERS.has(c));

  if (userHeavy && !toneHeavy) return 'user_heavy_tone_soft';
  if (!userHeavy && toneHeavy && userSoftish) return 'user_soft_tone_heavy';
  if (userHeavy && !toneHeavy && [...tone].some((c) => SOFT_STYLE_CLUSTERS.has(c))) {
    return 'user_heavy_tone_soft';
  }
  return null;
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
    blurb += ' Pickup family is unknown, lowering certainty.';
  }

  return { label, blurb };
}

function buildInsights(flags: {
  missingUserPickup: boolean;
  tuningMismatch: boolean;
  pickupMismatch: boolean;
  tightnessLowEnd: boolean;
  noiseSingleCoil: boolean;
}): string[] {
  const lines: string[] = [];

  if (flags.missingUserPickup) {
    lines.push('Pickup family unknown — gain accuracy reduced.');
  }

  if (flags.tightnessLowEnd) {
    lines.push('This tone will feel tighter than expected in your setup.');
  } else if (flags.tuningMismatch) {
    lines.push('Tuning mismatch will affect low-end response.');
  } else if (flags.pickupMismatch) {
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

  const missingPickup = !setup.pickupType;

  let tuningMismatch = false;
  let pickupMismatch = false;
  let tightnessLowEnd = false;
  let noiseSingleCoil = false;
  let styleMismatch = false;

  if (missingPickup) {
    score -= 15;
    warnings.push('Missing pickup type reduces accuracy');
  }

  if (tone.tuning && normTuning(tone.tuning) !== normTuning(setup.tuning)) {
    tuningMismatch = true;
    score -= 25;
    adjustments.push('Adjust low-end EQ slightly');
    warnings.push(`Tone was designed for ${tone.tuning}`);
  }

  if (tone.pickupType && setup.pickupType && tone.pickupType !== setup.pickupType) {
    pickupMismatch = true;
    score -= 30;
    adjustments.push('Adjust gain and EQ for pickup type');
    warnings.push(`Optimized for ${tone.pickupType.replace(/_/g, ' ')}`);
  }

  if (tone.noiseLevel != null && tone.noiseLevel > 7 && setup.pickupType === 'single_coil') {
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

  const userStyles = buildUserStyleClusters(contextTrim);
  const toneStyles = buildToneStyleClusters(tone);
  const styleGoalMismatch = resolveStyleGoalMismatch(userStyles, toneStyles);

  if (styleGoalMismatch === 'user_heavy_tone_soft') {
    score -= 40;
    warnings.push(
      'Your setup describes aggressive / high-gain territory; this preset reads cleaner or softer-voiced — expect a rebuild, not a small tweak.',
    );
    adjustments.push(
      'For modern heavy tones you will likely need more gain, tighter lows, and often a different amp or capture than this patch.',
    );
  } else if (styleGoalMismatch === 'user_soft_tone_heavy') {
    score -= 35;
    warnings.push(
      'Your setup describes cleaner or roots / groove territory; this patch is voiced for heavier drive.',
    );
    adjustments.push(
      'For that style, plan to pull gain back, soften highs, and lean on volume or a cleaner path — or pick a softer-voiced preset.',
    );
  }

  const compatibility = Math.max(0, score);

  let insights = buildInsights({
    missingUserPickup: missingPickup,
    tuningMismatch,
    pickupMismatch,
    tightnessLowEnd,
    noiseSingleCoil,
  });

  if (styleGoalMismatch === 'user_heavy_tone_soft') {
    insights = [
      'You are steering a softer-voiced preset toward heavy territory — EQ alone rarely gets there; a different capture or amp block is usually the real fix.',
      ...insights,
    ].slice(0, 2);
  } else if (styleGoalMismatch === 'user_soft_tone_heavy') {
    insights = [
      'You want headroom and nuance from a gain-heavy patch — treat this as a starting point and plan to back off drive and brightness.',
      ...insights,
    ].slice(0, 2);
  } else if (styleMismatch) {
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

  const confidence = buildConfidence(compatibility, missingPickup);

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
  if (pickupMismatch) apply('gain', tone.gain, +0.5);
  if (tone.tightness != null && tone.tightness > 7) apply('mid', tone.mid, +0.5);

  if (setup.playStyle === 'clean' && tone.gain != null && tone.gain >= 6) {
    apply('gain', tone.gain, -1);
    apply('treble', tone.treble, -0.5);
  }

  if (setup.playStyle === 'lead' && tone.gain != null && tone.gain <= 4) {
    apply('gain', tone.gain, +0.5);
    apply('mid', tone.mid, +0.5);
  }

  if (styleGoalMismatch === 'user_heavy_tone_soft') {
    apply('gain', suggestedTone.gain ?? tone.gain, +2);
    apply('mid', suggestedTone.mid ?? tone.mid, +0.5);
    apply('bass', suggestedTone.bass ?? tone.bass, -0.25);
  }

  if (styleGoalMismatch === 'user_soft_tone_heavy') {
    apply('gain', suggestedTone.gain ?? tone.gain, -1.5);
    apply('treble', suggestedTone.treble ?? tone.treble, -0.5);
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
