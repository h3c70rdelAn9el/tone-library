import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockTones, MOCK_DEMO_FAVORITE_IDS } from '../data/mockTones';
import type { PickupType, ToneCard } from '../types/tone';

export type SyncStatus = 'synced' | 'local' | 'error' | 'guest';

type ToneStore = {
  tones: ToneCard[];
  /** Favorites are not part of `ToneCard`; tracked per user (guest: local persist). */
  favoriteToneIds: string[];
  syncStatus: SyncStatus;
  isGuest: boolean;
  searchQuery: string;
  activeTags: string[];
  favoritesOnly: boolean;
  setTones: (tones: ToneCard[]) => void;
  setFavoriteToneIds: (ids: string[]) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setGuest: (isGuest: boolean) => void;
  setSearchQuery: (q: string) => void;
  setActiveTags: (tags: string[]) => void;
  toggleActiveTag: (tag: string) => void;
  setFavoritesOnly: (val: boolean) => void;
  clearFilters: () => void;
  addTone: (tone: ToneCard) => void;
  updateTone: (tone: ToneCard) => void;
  deleteTone: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  getToneById: (id: string) => ToneCard | undefined;
  clearStore: () => void;
};

function seedTones(): ToneCard[] {
  return mockTones.map((t) => ({ ...t }));
}

function seedFavoriteIds(): string[] {
  return [...MOCK_DEMO_FAVORITE_IDS];
}

/** Map persisted JSON that still uses `guitarType` / legacy `active` enum value. */
function migratePersistedTonePickup(t: ToneCard): ToneCard {
  const legacy = t as ToneCard & { guitarType?: string };
  if (legacy.guitarType == null) return t;
  if (legacy.pickupType != null) {
    const { guitarType: _omit, ...rest } = legacy;
    return rest as ToneCard;
  }
  let pickupType: PickupType | undefined;
  let activePickups: boolean | undefined;
  switch (legacy.guitarType) {
    case 'active':
      pickupType = 'humbucker';
      activePickups = true;
      break;
    case 'single_coil':
    case 'humbucker':
      pickupType = legacy.guitarType;
      break;
    default:
      break;
  }
  const { guitarType, ...rest } = legacy;
  return { ...rest, pickupType, activePickups } as ToneCard;
}

type LegacyPersistedTone = {
  id: string;
  name: string;
  tags?: string[];
  genreTags?: string[];
  notes?: string;
  description?: string;
  mixNotes?: string;
  namFile?: string;
  irFile?: string;
  namFileURL?: string | null;
  namFileUrl?: string | null;
  irFileURL?: string | null;
  irFileUrl?: string | null;
  favorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
  ampStyle?: ToneCard['ampStyle'];
  [key: string]: unknown;
};

function migrateLegacyTone(raw: LegacyPersistedTone): ToneCard {
  const genreTags = raw.genreTags ?? raw.tags ?? [];
  const description =
    typeof raw.description === 'string' && raw.description.trim() !== ''
      ? raw.description.trim()
      : undefined;
  const mixNotes =
    typeof raw.mixNotes === 'string' && raw.mixNotes.trim() !== ''
      ? raw.mixNotes.trim()
      : typeof raw.notes === 'string' && raw.notes.trim() !== ''
        ? raw.notes.trim()
        : undefined;
  const namFileUrl = raw.namFileUrl ?? raw.namFileURL ?? null;
  const irFileUrl = raw.irFileUrl ?? raw.irFileURL ?? null;
  const updatedAt =
    typeof raw.updatedAt === 'string'
      ? raw.updatedAt
      : `${(raw.createdAt ?? '1970-01-01').replace(/T.*/, '')}T00:00:00.000Z`;

  return {
    id: raw.id,
    name: raw.name,
    description,
    mixNotes,
    namFile: raw.namFile ?? '',
    irFile: raw.irFile ?? '',
    namFileUrl,
    irFileUrl,
    gain: null,
    bass: null,
    mid: null,
    treble: null,
    presence: null,
    genreTags,
    playStyle: undefined,
    tightness: null,
    clarity: null,
    noiseLevel: null,
    ampStyle: raw.ampStyle ?? 'modern-black',
    createdAt: raw.createdAt ?? '1970-01-01',
    updatedAt,
  };
}

function normalizeTonesFromPersist(raw: unknown): {
  tones: ToneCard[];
  extraFavoriteIds: string[];
} {
  if (!raw || !Array.isArray(raw)) {
    return { tones: seedTones(), extraFavoriteIds: [] };
  }
  const extraFavoriteIds: string[] = [];
  const tones: ToneCard[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object' || !('id' in item)) continue;
    const t = item as LegacyPersistedTone;
    if (
      'genreTags' in t &&
      Array.isArray(t.genreTags) &&
      (!('tags' in t) || t.tags === undefined)
    ) {
      tones.push(t as ToneCard);
      continue;
    }
    if ('tags' in t && Array.isArray(t.tags)) {
      if (t.favorite) extraFavoriteIds.push(t.id);
      tones.push(migrateLegacyTone(t));
      continue;
    }
    tones.push(migrateLegacyTone(t));
  }
  return { tones, extraFavoriteIds };
}

export const useToneStore = create<ToneStore>()(
  persist(
    (set, get) => ({
      tones: seedTones(),
      favoriteToneIds: seedFavoriteIds(),
      syncStatus: 'guest' as SyncStatus,
      isGuest: true,
      searchQuery: '',
      activeTags: [] as string[],
      favoritesOnly: false,
      setTones: (tones) => set({ tones }),
      setFavoriteToneIds: (favoriteToneIds) => set({ favoriteToneIds }),
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
      clearFilters: () =>
        set({ searchQuery: '', activeTags: [], favoritesOnly: false }),
      addTone: (tone) => set((s) => ({ tones: [tone, ...s.tones] })),
      updateTone: (tone) =>
        set((s) => {
          const prev = s.tones.find((t) => t.id === tone.id);
          if (
            prev?.namFileUrl?.startsWith('blob:') &&
            prev.namFileUrl !== tone.namFileUrl
          ) {
            URL.revokeObjectURL(prev.namFileUrl);
          }
          if (
            prev?.irFileUrl?.startsWith('blob:') &&
            prev.irFileUrl !== tone.irFileUrl
          ) {
            URL.revokeObjectURL(prev.irFileUrl);
          }
          return {
            tones: s.tones.map((t) => (t.id === tone.id ? tone : t)),
          };
        }),
      deleteTone: (id) =>
        set((s) => {
          const tone = s.tones.find((t) => t.id === id);
          if (tone?.namFileUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(tone.namFileUrl);
          }
          if (tone?.irFileUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(tone.irFileUrl);
          }
          return {
            tones: s.tones.filter((t) => t.id !== id),
            favoriteToneIds: s.favoriteToneIds.filter((x) => x !== id),
          };
        }),
      toggleFavorite: (id) =>
        set((s) => ({
          favoriteToneIds: s.favoriteToneIds.includes(id)
            ? s.favoriteToneIds.filter((x) => x !== id)
            : [...s.favoriteToneIds, id],
        })),
      isFavorite: (id) => get().favoriteToneIds.includes(id),
      getToneById: (id) => get().tones.find((t) => t.id === id),
      clearStore: () => {
        try {
          useToneStore.persist.clearStorage();
        } catch {
          /* ignore */
        }
        set({
          tones: seedTones(),
          favoriteToneIds: seedFavoriteIds(),
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
        favoriteToneIds: state.favoriteToneIds,
        syncStatus: state.syncStatus,
      }),
      merge: (persistedState, currentState) => {
        const p = persistedState as {
          tones?: ToneCard[];
          favoriteToneIds?: string[];
          syncStatus?: SyncStatus;
        } | null;
        const raw = p?.tones;
        if (!raw || !Array.isArray(raw)) {
          return { ...currentState, isGuest: currentState.isGuest };
        }
        const { tones, extraFavoriteIds } = normalizeTonesFromPersist(raw);
        const fav = Array.isArray(p?.favoriteToneIds)
          ? [...new Set([...p.favoriteToneIds, ...extraFavoriteIds])]
          : [...new Set([...seedFavoriteIds(), ...extraFavoriteIds])];
        return {
          ...currentState,
          tones: tones
            .map(migratePersistedTonePickup)
            .map((t) => ({
              ...t,
              namFileUrl: t.namFileUrl ?? null,
              irFileUrl: t.irFileUrl ?? null,
            })),
          favoriteToneIds: fav,
          syncStatus: p?.syncStatus ?? currentState.syncStatus,
          isGuest: currentState.isGuest,
        };
      },
    },
  ),
);
