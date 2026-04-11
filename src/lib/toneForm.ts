import type { AmpStyle, Tone } from '../types/tone';

/** Sorted unique tags from existing tones (for upload suggestions). */
export function uniqueTagsFromTones(tones: Tone[]): string[] {
  const set = new Set<string>();
  for (const tone of tones) {
    for (const tag of tone.tags) {
      set.add(tag);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export type UploadPreviewInput = {
  name: string;
  tags: string[];
  notes: string;
  namFile: string;
  irFile: string;
  favorite: boolean;
  ampStyle: AmpStyle;
};

const PREVIEW_ID = 'upload-preview';

/** Synthetic tone for amp preview on the upload screen (not persisted). */
export function buildUploadPreviewTone(input: UploadPreviewInput): Tone {
  return {
    id: PREVIEW_ID,
    name: input.name.trim() || 'Your tone name',
    tags: input.tags,
    notes: input.notes.trim(),
    namFile: input.namFile || '',
    irFile: input.irFile || '',
    namFileURL: null,
    irFileURL: null,
    createdAt: new Date().toISOString().slice(0, 10),
    favorite: input.favorite,
    ampStyle: input.ampStyle,
  };
}

export const AMP_STYLE_OPTIONS: { value: AmpStyle; label: string }[] = [
  { value: 'modern-black', label: 'Modern / High Gain' },
  { value: 'vintage-cream', label: 'Vintage / Clean' },
  { value: 'british-gold', label: 'British / Classic' },
  { value: 'custom-dark', label: 'Custom / Dark' },
];
