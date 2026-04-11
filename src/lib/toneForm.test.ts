import { describe, expect, it } from 'vitest';
import {
  AMP_STYLE_OPTIONS,
  buildUploadPreviewTone,
  uniqueTagsFromTones,
} from './toneForm';
import type { Tone } from '../types/tone';

const tone = (overrides: Partial<Tone> = {}): Tone => ({
  id: '1',
  name: 'T',
  tags: ['a', 'b'],
  notes: '',
  namFile: '',
  irFile: '',
  namFileURL: null,
  irFileURL: null,
  createdAt: '2025-01-01',
  favorite: false,
  ...overrides,
});

describe('uniqueTagsFromTones', () => {
  it('returns sorted unique tags across tones', () => {
    expect(
      uniqueTagsFromTones([
        tone({ tags: ['metal', 'clean'] }),
        tone({ tags: ['metal', 'ambient'] }),
      ]),
    ).toEqual(['ambient', 'clean', 'metal']);
  });

  it('returns empty array for no tones', () => {
    expect(uniqueTagsFromTones([])).toEqual([]);
  });
});

describe('buildUploadPreviewTone', () => {
  it('uses placeholder name when empty', () => {
    const t = buildUploadPreviewTone({
      name: '   ',
      tags: [],
      notes: '',
      namFile: '',
      irFile: '',
      favorite: false,
      ampStyle: 'modern-black',
    });
    expect(t.name).toBe('Your tone name');
    expect(t.id).toBe('upload-preview');
  });

  it('preserves amp style and tags', () => {
    const t = buildUploadPreviewTone({
      name: 'Lead',
      tags: ['high-gain'],
      notes: '  note  ',
      namFile: 'x.nam',
      irFile: '',
      favorite: true,
      ampStyle: 'british-gold',
    });
    expect(t.name).toBe('Lead');
    expect(t.tags).toEqual(['high-gain']);
    expect(t.notes).toBe('note');
    expect(t.namFile).toBe('x.nam');
    expect(t.favorite).toBe(true);
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
