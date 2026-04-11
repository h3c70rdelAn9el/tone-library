import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockTones } from '../data/mockTones';
import type { Tone } from '../types/tone';

export type SyncStatus = 'synced' | 'local' | 'error';

type ToneStore = {
  tones: Tone[];
  syncStatus: SyncStatus;
  setTones: (tones: Tone[]) => void;
  setSyncStatus: (status: SyncStatus) => void;
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
      syncStatus: 'local' as SyncStatus,
      setTones: (tones) => set({ tones }),
      setSyncStatus: (syncStatus) => set({ syncStatus }),
      addTone: (tone) => set((s) => ({ tones: [tone, ...s.tones] })),
      deleteTone: (id) =>
        set((s) => {
          const tone = s.tones.find((t) => t.id === id);
          if (tone?.namFileURL?.startsWith('blob:')) {
            URL.revokeObjectURL(tone.namFileURL);
          }
          if (tone?.irFileURL?.startsWith('blob:')) {
            URL.revokeObjectURL(tone.irFileURL);
          }
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
      partialize: (state) => ({
        tones: state.tones,
        syncStatus: state.syncStatus,
      }),
      merge: (persistedState, currentState) => {
        const p = persistedState as {
          tones?: Tone[];
          syncStatus?: SyncStatus;
        } | null;
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
          syncStatus: p?.syncStatus ?? currentState.syncStatus,
        };
      },
    },
  ),
);
