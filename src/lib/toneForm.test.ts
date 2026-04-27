import { describe, expect, it } from 'vitest';
import {
  AMP_STYLE_OPTIONS,
  buildUploadPreviewTone,
  uniqueGenreTagsFromTones,
} from './toneForm';
import type { ToneCard } from '../types/tone';

const tone = (overrides: Partial<ToneCard> = {}): ToneCard => ({
  id: '1',
  name: 'T',
  genreTags: ['a', 'b'],
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
  ...overrides,
});

describe('uniqueGenreTagsFromTones', () => {
  it('returns sorted unique tags across tones', () => {
    expect(
      uniqueGenreTagsFromTones([
        tone({ genreTags: ['metal', 'clean'] }),
        tone({ genreTags: ['metal', 'ambient'] }),
      ]),
    ).toEqual(['ambient', 'clean', 'metal']);
  });

  it('returns empty array for no tones', () => {
    expect(uniqueGenreTagsFromTones([])).toEqual([]);
  });
});

describe('buildUploadPreviewTone', () => {
  it('uses placeholder name when empty', () => {
    const t = buildUploadPreviewTone({
      name: '   ',
      genreTags: [],
      description: '',
      mixNotes: '',
      namFile: '',
      irFile: '',
      ampStyle: 'modern-black',
    });
    expect(t.name).toBe('Your tone name');
    expect(t.id).toBe('upload-preview');
  });

  it('preserves amp style and genre tags', () => {
    const t = buildUploadPreviewTone({
      name: 'Lead',
      genreTags: ['high-gain'],
      description: '  why  ',
      mixNotes: '  how  ',
      namFile: 'x.nam',
      irFile: '',
      ampStyle: 'british-gold',
    });
    expect(t.name).toBe('Lead');
    expect(t.genreTags).toEqual(['high-gain']);
    expect(t.description).toBe('why');
    expect(t.mixNotes).toBe('how');
    expect(t.namFile).toBe('x.nam');
    expect(t.ampStyle).toBe('british-gold');
  });
});

describe('AMP_STYLE_OPTIONS', () => {
  it('covers all four amp styles', () => {
    const values = AMP_STYLE_OPTIONS.map((o) => o.value).sort();
    expect(values).toEqual([
      'british-gold',
      'custom-dark',
      'modern-black',
      'vintage-cream',
    ]);
  });
});
