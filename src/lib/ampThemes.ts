import type { AmpStyle } from '../types/tone';
import type { ToneCard } from '../types/tone';

export type AmpTheme = {
  body: string;
  panel: string;
  accent: string;
  knob: string;
  text: string;
  grille: string;
  grillePattern: string;
};

export const AMP_THEMES: Record<AmpStyle, AmpTheme> = {
  'modern-black': {
    body: '#1a1a1a',
    panel: '#2a2a2a',
    accent: '#e8ff47',
    knob: '#333333',
    text: '#e8e8f0',
    grille: '#252525',
    grillePattern: '#333333',
  },
  'vintage-cream': {
    body: '#f5e6c8',
    panel: '#c8a96e',
    accent: '#c8522a',
    knob: '#8b6914',
    text: '#2a1a0a',
    grille: '#d4c4a8',
    grillePattern: '#b8a080',
  },
  'british-gold': {
    body: '#1c1c1c',
    panel: '#b8922a',
    accent: '#e8c040',
    knob: '#222222',
    text: '#f0e0a0',
    grille: '#2a2a2a',
    grillePattern: '#444444',
  },
  'custom-dark': {
    body: '#0d0d14',
    panel: '#1a1a2e',
    accent: '#7b2fff',
    knob: '#1a1a2e',
    text: '#c0a0ff',
    grille: '#12121f',
    grillePattern: '#2a2040',
  },
};

export function resolveAmpTheme(tone: ToneCard): AmpTheme {
  const key = tone.ampStyle ?? 'modern-black';
  return AMP_THEMES[key] ?? AMP_THEMES['modern-black'];
}

export type KnobValues = {
  gain: number;
  bass: number;
  mid: number;
  treble: number;
  presence: number;
  volume: number;
};

/** Stored EQ / presence use 0–10; knob UI uses 0–1. When unset, fall back to genre-tag hints (cosmetic). */
export function deriveKnobValues(tone: ToneCard): KnobValues {
  const tags = new Set(tone.genreTags.map((t) => t.toLowerCase()));
  const neutral = 0.5;
  const fromTag: KnobValues = {
    gain: neutral,
    bass: neutral,
    mid: neutral,
    treble: neutral,
    presence: neutral,
    volume: neutral,
  };

  if (tags.has('high-gain')) fromTag.gain = 0.85;
  if (tags.has('metal') || tags.has('djent')) {
    fromTag.treble = 0.7;
    fromTag.bass = 0.6;
  }
  if (tags.has('clean')) {
    fromTag.gain = 0.2;
    fromTag.volume = 0.6;
  }
  if (tags.has('ambient')) {
    fromTag.presence = 0.3;
    fromTag.treble = 0.4;
  }
  if (tags.has('blues')) fromTag.mid = 0.75;

  const scale = (n: number | null, fallback: number) =>
    n == null ? fallback : Math.min(1, Math.max(0, n / 10));

  return {
    gain: scale(tone.gain, fromTag.gain),
    bass: scale(tone.bass, fromTag.bass),
    mid: scale(tone.mid, fromTag.mid),
    treble: scale(tone.treble, fromTag.treble),
    presence: scale(tone.presence, fromTag.presence),
    volume: fromTag.volume,
  };
}
