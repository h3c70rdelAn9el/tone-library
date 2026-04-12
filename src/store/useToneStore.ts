import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockTones } from '../data/mockTones';
import type { Tone } from '../types/tone';

export type SyncStatus = 'synced' | 'local' | 'error' | 'guest';

type ToneStore = {
  tones: Tone[];
  syncStatus: SyncStatus;
  isGuest: boolean;
  searchQuery: string;
  activeTags: string[];
  favoritesOnly: boolean;
  setTones: (tones: Tone[]) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setGuest: (isGuest: boolean) => void;
  setSearchQuery: (q: string) => void;
  setActiveTags: (tags: string[]) => void;
  toggleActiveTag: (tag: string) => void;
  setFavoritesOnly: (val: boolean) => void;
  clearFilters: () => void;
  addTone: (tone: Tone) => void;
  updateTone: (tone: Tone) => void;
  deleteTone: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getToneById: (id: string) => Tone | undefined;
  clearStore: () => void;
};

function seedTones(): Tone[] {
  return mockTones.map((t) => ({ ...t }));
}

export const useToneStore = create<ToneStore>()(
  persist(
    (set, get) => ({
      tones: seedTones(),
      syncStatus: 'guest' as SyncStatus,
      isGuest: true,
      searchQuery: '',
      activeTags: [] as string[],
      favoritesOnly: false,
      setTones: (tones) => set({ tones }),
      setSyncStatus: (syncStatus) => set({ syncStatus }),
      setGuest: (isGuest) => set({ isGuest }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setActiveTags: (activeTags) => set({ activeTags }),
      toggleActiveTag: (tag) =>
        set((s) => ({
          activeTags: s.activeTags.includes(tag)
            ? s.activeTags.filter((t) => t !== tag)
            : [...s.activeTags, tag],
        })),
      setFavoritesOnly: (favoritesOnly) => set({ favoritesOnly }),
      clearFilters: () => set({ searchQuery: '', activeTags: [], favoritesOnly: false }),
      addTone: (tone) => set((s) => ({ tones: [tone, ...s.tones] })),
      updateTone: (tone) =>
        set((s) => {
          const prev = s.tones.find((t) => t.id === tone.id);
          if (prev?.namFileURL?.startsWith('blob:') && prev.namFileURL !== tone.namFileURL) {
            URL.revokeObjectURL(prev.namFileURL);
          }
          if (prev?.irFileURL?.startsWith('blob:') && prev.irFileURL !== tone.irFileURL) {
            URL.revokeObjectURL(prev.irFileURL);
          }
          return {
            tones: s.tones.map((t) => (t.id === tone.id ? tone : t)),
          };
        }),
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
          tones: s.tones.map((t) => (t.id === id ? { ...t, favorite: !t.favorite } : t)),
        })),
      getToneById: (id) => get().tones.find((t) => t.id === id),
      clearStore: () => {
        try {
          useToneStore.persist.clearStorage();
        } catch {
          /* ignore */
        }
        set({
          tones: seedTones(),
          syncStatus: 'guest',
          isGuest: true,
          searchQuery: '',
          activeTags: [],
          favoritesOnly: false,
        });
      },
    }),
    {
      name: 'ToneVault',
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
          return { ...currentState, isGuest: currentState.isGuest };
        }
        return {
          ...currentState,
          tones: raw.map((t) => ({
            ...t,
            namFileURL: t.namFileURL ?? null,
            irFileURL: t.irFileURL ?? null,
          })),
          syncStatus: p?.syncStatus ?? currentState.syncStatus,
          isGuest: currentState.isGuest,
        };
      },
    },
  ),
);
