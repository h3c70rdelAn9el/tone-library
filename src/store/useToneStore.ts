import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockTones } from '../data/mockTones';
import type { Tone } from '../types/tone';

type ToneStore = {
  tones: Tone[];
  addTone: (tone: Tone) => void;
  deleteTone: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getToneById: (id: string) => Tone | undefined;
};

function seedTones(): Tone[] {
  return mockTones.map((t) => ({ ...t }));
}

export const useToneStore = create<ToneStore>()(
  persist(
    (set, get) => ({
      tones: seedTones(),
      addTone: (tone) => set((s) => ({ tones: [tone, ...s.tones] })),
      deleteTone: (id) =>
        set((s) => {
          const tone = s.tones.find((t) => t.id === id);
          if (tone?.namFileURL) URL.revokeObjectURL(tone.namFileURL);
          if (tone?.irFileURL) URL.revokeObjectURL(tone.irFileURL);
          return { tones: s.tones.filter((t) => t.id !== id) };
        }),
      toggleFavorite: (id) =>
        set((s) => ({
          tones: s.tones.map((t) =>
            t.id === id ? { ...t, favorite: !t.favorite } : t,
          ),
        })),
      getToneById: (id) => get().tones.find((t) => t.id === id),
    }),
    {
      name: 'tone-library',
      partialize: (state) => ({ tones: state.tones }),
      merge: (persistedState, currentState) => {
        const p = persistedState as { tones?: Tone[] } | null | undefined;
        const raw = p?.tones;
        if (!raw || !Array.isArray(raw)) {
          return currentState;
        }
        return {
          ...currentState,
          tones: raw.map((t) => ({
            ...t,
            namFileURL: t.namFileURL ?? null,
            irFileURL: t.irFileURL ?? null,
          })),
        };
      },
    },
  ),
);
