import { describe, expect, it } from 'vitest';
import { recreateTone } from './recreateTone';
import type { ToneCard } from '../types/tone';

const baseTone = (): ToneCard => ({
  id: 'x',
  name: 'Test',
  genreTags: [],
  namFile: '',
  irFile: '',
  namFileUrl: null,
  irFileUrl: null,
  gain: null,
  bass: null,
  mid: null,
  treble: null,
  presence: null,
  tightness: null,
  clarity: null,
  noiseLevel: null,
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01T00:00:00.000Z',
});

describe('recreateTone', () => {
  it('starts at 100 when tone has no contextual fields', () => {
    const r = recreateTone(baseTone(), {
      tuning: 'Standard',
      guitarType: 'humbucker',
    });
    expect(r.compatibility).toBe(100);
    expect(r.adjustments).toHaveLength(0);
  });

  it('applies tuning and guitar penalties', () => {
    const tone: ToneCard = {
      ...baseTone(),
      tuning: 'Drop C',
      guitarType: 'humbucker',
    };
    const r = recreateTone(tone, {
      tuning: 'Standard',
      guitarType: 'single_coil',
    });
    expect(r.compatibility).toBe(45);
    expect(r.adjustments.length).toBeGreaterThanOrEqual(2);
    expect(r.warnings.some((w) => w.includes('Drop C'))).toBe(true);
  });

  it('warns on high noise with single coil setup', () => {
    const tone: ToneCard = {
      ...baseTone(),
      noiseLevel: 8,
    };
    const r = recreateTone(tone, {
      tuning: 'Standard',
      guitarType: 'single_coil',
    });
    expect(r.warnings.some((w) => /noise/i.test(w))).toBe(true);
  });

  it('suggests low-end reduction for high tightness when not Drop C', () => {
    const tone: ToneCard = {
      ...baseTone(),
      tightness: 8,
    };
    const r = recreateTone(tone, {
      tuning: 'Standard',
      guitarType: 'humbucker',
    });
    expect(
      r.adjustments.some((a) => /low-end/i.test(a)),
    ).toBe(true);
  });

  it('skips tightness low-end hint when setup is Drop C', () => {
    const tone: ToneCard = {
      ...baseTone(),
      tightness: 8,
    };
    const r = recreateTone(tone, {
      tuning: 'Drop C',
      guitarType: 'humbucker',
    });
    expect(
      r.adjustments.some((a) => /low-end/i.test(a)),
    ).toBe(false);
  });
});
