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
    expect(r.insights.length).toBeGreaterThanOrEqual(1);
    expect(r.confidence.label).toBeTruthy();
  });

  it('applies -15 and warning when user guitar type is missing', () => {
    const r = recreateTone(baseTone(), { tuning: 'Standard' });
    expect(r.compatibility).toBe(85);
    expect(r.warnings).toContain('Missing guitar type reduces accuracy');
  });

  it('does not apply pickup mismatch when user guitar is missing', () => {
    const tone: ToneCard = {
      ...baseTone(),
      guitarType: 'humbucker',
    };
    const r = recreateTone(tone, { tuning: 'Standard' });
    expect(r.compatibility).toBe(85);
    expect(r.warnings.some((w) => w.includes('Optimized for'))).toBe(false);
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
    expect(
      r.insights.some((i) => /tighter/i.test(i)),
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

  it('suggestedTone lowers bass on tuning mismatch when bass is set', () => {
    const tone: ToneCard = {
      ...baseTone(),
      tuning: 'Drop C',
      bass: 6,
    };
    const r = recreateTone(tone, {
      tuning: 'Standard',
      guitarType: 'humbucker',
    });
    expect(r.suggestedTone?.bass).toBe(5.5);
  });

  it('suggestedTone raises gain on guitar mismatch when gain is set', () => {
    const tone: ToneCard = {
      ...baseTone(),
      guitarType: 'humbucker',
      gain: 5,
    };
    const r = recreateTone(tone, {
      tuning: 'Standard',
      guitarType: 'single_coil',
    });
    expect(r.suggestedTone?.gain).toBe(5.5);
  });

  it('suggestedTone raises mid when tightness > 7 and mid is set', () => {
    const tone: ToneCard = {
      ...baseTone(),
      tightness: 8,
      mid: 4,
    };
    const r = recreateTone(tone, {
      tuning: 'Standard',
      guitarType: 'humbucker',
    });
    expect(r.suggestedTone?.mid).toBe(4.5);
  });

  it('penalizes and warns when user play style differs from tone tag', () => {
    const tone: ToneCard = {
      ...baseTone(),
      playStyle: 'lead',
    };
    const r = recreateTone(tone, {
      tuning: 'Standard',
      guitarType: 'humbucker',
      playStyle: 'rhythm',
    });
    expect(r.compatibility).toBe(90);
    expect(
      r.warnings.some((w) => /lead.*rhythm|rhythm.*lead/i.test(w)),
    ).toBe(true);
    expect(
      r.adjustments.some((a) => /role/i.test(a)),
    ).toBe(true);
  });

  it('clean intent on high-gain tone lowers suggested gain and treble', () => {
    const tone: ToneCard = {
      ...baseTone(),
      gain: 7,
      treble: 6,
    };
    const r = recreateTone(tone, {
      tuning: 'Standard',
      guitarType: 'humbucker',
      playStyle: 'clean',
    });
    expect(r.compatibility).toBe(95);
    expect(r.suggestedTone?.gain).toBe(6);
    expect(r.suggestedTone?.treble).toBe(5.5);
    expect(r.insights[0]).toMatch(/clean/i);
  });

  it('lead intent on low-gain tone bumps suggested gain and mid', () => {
    const tone: ToneCard = {
      ...baseTone(),
      gain: 3,
      mid: 5,
    };
    const r = recreateTone(tone, {
      tuning: 'Standard',
      guitarType: 'humbucker',
      playStyle: 'lead',
    });
    expect(r.compatibility).toBe(95);
    expect(r.suggestedTone?.gain).toBe(3.5);
    expect(r.suggestedTone?.mid).toBe(5.5);
    expect(r.insights[0]).toMatch(/lead/i);
  });

  it('echoes setup context in notes and adds home-volume hint for bedroom', () => {
    const r = recreateTone(baseTone(), {
      tuning: 'Standard',
      guitarType: 'humbucker',
      context: '  Bedroom practice  ',
    });
    expect(r.notes.some((n) => /Bedroom practice/.test(n))).toBe(true);
    expect(r.adjustments.some((a) => /home volume/i.test(a))).toBe(true);
  });
});
