import type { AmpStyle, ToneCard } from '../types/tone';

/** Sorted unique genre tags from existing tones (for upload suggestions). */
export function uniqueGenreTagsFromTones(tones: ToneCard[]): string[] {
  const set = new Set<string>();
  for (const tone of tones) {
    for (const tag of tone.genreTags) {
      set.add(tag);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export type UploadPreviewInput = {
  name: string;
  genreTags: string[];
  description: string;
  mixNotes: string;
  namFile: string;
  irFile: string;
  ampStyle: AmpStyle;
};

const PREVIEW_ID = 'upload-preview';

/** Synthetic tone for amp preview on the upload screen (not persisted). */
export function buildUploadPreviewTone(input: UploadPreviewInput): ToneCard {
  return {
    id: PREVIEW_ID,
    name: input.name.trim() || 'Your tone name',
    genreTags: input.genreTags,
    description: input.description.trim() || undefined,
    mixNotes: input.mixNotes.trim() || undefined,
    namFile: input.namFile || '',
    irFile: input.irFile || '',
    namFileUrl: null,
    irFileUrl: null,
    gain: null,
    bass: null,
    mid: null,
    treble: null,
    presence: null,
    playStyle: undefined,
    tightness: null,
    clarity: null,
    noiseLevel: null,
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString(),
    ampStyle: input.ampStyle,
  };
}

export const AMP_STYLE_OPTIONS: { value: AmpStyle; label: string }[] = [
  { value: 'modern-black', label: 'Modern / High Gain' },
  { value: 'vintage-cream', label: 'Vintage / Clean' },
  { value: 'british-gold', label: 'British / Classic' },
  { value: 'custom-dark', label: 'Custom / Dark' },
];
