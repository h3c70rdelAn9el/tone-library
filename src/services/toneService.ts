import supabase, { isSupabaseConfigured } from '../lib/supabase';
import { mockTones } from '../data/mockTones';
import type {
  AmpStyle,
  GuitarType,
  PickupPosition,
  PlayStyle,
  ToneCard,
} from '../types/tone';

/** Dev-only: force mock in service layer (guest mode uses useTones + store instead). */
export const USE_MOCK_DATA = false;

function parseAmpStyle(raw: string | null | undefined): AmpStyle | null {
  if (raw == null || raw === '') return null;
  const allowed: AmpStyle[] = [
    'modern-black',
    'vintage-cream',
    'british-gold',
    'custom-dark',
  ];
  return (allowed as string[]).includes(raw) ? (raw as AmpStyle) : null;
}

function parseGuitarType(raw: string | null | undefined): GuitarType | undefined {
  if (raw == null || raw === '') return undefined;
  const allowed: GuitarType[] = ['single_coil', 'humbucker', 'active'];
  return (allowed as string[]).includes(raw) ? (raw as GuitarType) : undefined;
}

function parsePickupPosition(
  raw: string | null | undefined,
): PickupPosition | undefined {
  if (raw == null || raw === '') return undefined;
  const allowed: PickupPosition[] = ['neck', 'middle', 'bridge'];
  return (allowed as string[]).includes(raw) ? (raw as PickupPosition) : undefined;
}

function parsePlayStyle(raw: string | null | undefined): PlayStyle | undefined {
  if (raw == null || raw === '') return undefined;
  const allowed: PlayStyle[] = ['rhythm', 'lead', 'ambient', 'clean'];
  return (allowed as string[]).includes(raw) ? (raw as PlayStyle) : undefined;
}

type DbToneRow = {
  id: string;
  name: string;
  genre_tags: string[] | null;
  description: string | null;
  mix_notes: string | null;
  nam_file: string | null;
  ir_file: string | null;
  nam_file_url: string | null;
  ir_file_url: string | null;
  amp_model: string | null;
  gain: number | null;
  bass: number | null;
  mid: number | null;
  treble: number | null;
  presence: number | null;
  tuning: string | null;
  guitar_type: string | null;
  pickup_position: string | null;
  play_style: string | null;
  tightness: number | null;
  clarity: number | null;
  noise_level: number | null;
  amp_style?: string | null;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
};

function rowToToneCard(row: DbToneRow): ToneCard {
  const created = row.created_at;
  const dateOnly =
    created.length >= 10 ? created.slice(0, 10) : created.split('T')[0] ?? created;
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    mixNotes: row.mix_notes ?? undefined,
    ampModel: row.amp_model ?? undefined,
    namFile: row.nam_file ?? '',
    irFile: row.ir_file ?? '',
    namFileUrl: row.nam_file_url,
    irFileUrl: row.ir_file_url,
    gain: row.gain,
    bass: row.bass,
    mid: row.mid,
    treble: row.treble,
    presence: row.presence,
    tuning: row.tuning ?? undefined,
    guitarType: parseGuitarType(row.guitar_type),
    pickupPosition: parsePickupPosition(row.pickup_position),
    genreTags: row.genre_tags ?? [],
    playStyle: parsePlayStyle(row.play_style),
    tightness: row.tightness,
    clarity: row.clarity,
    noiseLevel: row.noise_level,
    ampStyle: parseAmpStyle(row.amp_style),
    createdAt: dateOnly,
    updatedAt: row.updated_at,
  };
}

/** Returns null when the request failed. Empty array means no rows. */
export async function tryFetchAllTones(): Promise<ToneCard[] | null> {
  if (USE_MOCK_DATA) {
    return mockTones;
  }
  if (!isSupabaseConfigured()) {
    console.error('Supabase env vars are not configured.');
    return null;
  }
  const { data, error } = await supabase
    .from('tones')
    .select('*')
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return null;
  }

  return ((data ?? []) as DbToneRow[]).map(rowToToneCard);
}

export async function fetchAllTones(): Promise<ToneCard[]> {
  const tones = await tryFetchAllTones();
  return tones ?? [];
}

/** Returns null on failure; empty array if signed out or none. */
export async function tryFetchFavoriteToneIds(): Promise<string[] | null> {
  if (USE_MOCK_DATA || !isSupabaseConfigured()) {
    return [];
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('tone_favorites')
    .select('tone_id')
    .eq('user_id', user.id);

  if (error) {
    console.error(error);
    return null;
  }

  return (data ?? []).map((r) => (r as { tone_id: string }).tone_id);
}

/** Client-side filter when Supabase search is unavailable. */
export function filterTonesLocally(
  tones: ToneCard[],
  query: string,
  genreTags: string[],
  favoritesOnly: boolean,
  favoriteToneIds: Set<string>,
): ToneCard[] {
  const q = query.trim().toLowerCase();
  return tones.filter((tone) => {
    if (favoritesOnly && !favoriteToneIds.has(tone.id)) return false;
    if (
      genreTags.length > 0 &&
      !genreTags.every((t) => tone.genreTags.includes(t))
    ) {
      return false;
    }
    if (q) {
      const hay =
        `${tone.name} ${tone.description ?? ''} ${tone.mixNotes ?? ''} ${tone.genreTags.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Returns null on request failure (same as tryFetchAllTones). */
export async function trySearchTones(
  query: string,
  genreTags: string[],
  favoritesOnly: boolean,
): Promise<ToneCard[] | null> {
  if (USE_MOCK_DATA) {
    return null;
  }
  if (!isSupabaseConfigured()) {
    return null;
  }

  let favIds: string[] | null = null;
  if (favoritesOnly) {
    favIds = await tryFetchFavoriteToneIds();
    if (favIds === null) return null;
    if (favIds.length === 0) return [];
  }

  let q = supabase.from('tones').select('*').order('updated_at', { ascending: false });

  if (query.trim()) {
    q = q.textSearch('search_vector', query.trim(), {
      type: 'plain',
      config: 'english',
    });
  }
  if (genreTags.length > 0) {
    q = q.contains('genre_tags', genreTags);
  }
  if (favoritesOnly && favIds) {
    q = q.in('id', favIds);
  }

  const { data, error } = await q;

  if (error) {
    console.error(error);
    return null;
  }

  return ((data ?? []) as DbToneRow[]).map(rowToToneCard);
}

export async function searchTones(
  query: string,
  genreTags: string[],
  favoritesOnly: boolean,
): Promise<ToneCard[]> {
  const r = await trySearchTones(query, genreTags, favoritesOnly);
  return r ?? [];
}

export async function fetchAllGenreTags(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase.from('tones').select('genre_tags');

  if (error) {
    console.error(error);
    return [];
  }

  const set = new Set<string>();
  for (const row of data ?? []) {
    const g = (row as { genre_tags: string[] | null }).genre_tags;
    if (g) {
      for (const t of g) set.add(t);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export type CreateToneCardInput = Omit<ToneCard, 'id' | 'createdAt' | 'updatedAt'>;

export async function createTone(
  tone: CreateToneCardInput,
  userId: string,
): Promise<ToneCard | null> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase env vars are not configured.');
    return null;
  }

  const insert = {
    name: tone.name,
    genre_tags: tone.genreTags,
    description: tone.description ?? null,
    mix_notes: tone.mixNotes ?? null,
    nam_file: tone.namFile || null,
    ir_file: tone.irFile || null,
    nam_file_url: tone.namFileUrl,
    ir_file_url: tone.irFileUrl,
    amp_model: tone.ampModel ?? null,
    gain: tone.gain,
    bass: tone.bass,
    mid: tone.mid,
    treble: tone.treble,
    presence: tone.presence,
    tuning: tone.tuning ?? null,
    guitar_type: tone.guitarType ?? null,
    pickup_position: tone.pickupPosition ?? null,
    play_style: tone.playStyle ?? null,
    tightness: tone.tightness,
    clarity: tone.clarity,
    noise_level: tone.noiseLevel,
    amp_style: tone.ampStyle ?? 'modern-black',
    user_id: userId,
  };

  const { data, error } = await supabase.from('tones').insert(insert).select().single();

  if (error) {
    console.error(error);
    return null;
  }

  return rowToToneCard(data as DbToneRow);
}

export type ToneCardDbUpdate = {
  name: string;
  genre_tags: string[];
  description: string | null;
  mix_notes: string | null;
  nam_file: string | null;
  ir_file: string | null;
  nam_file_url: string | null;
  ir_file_url: string | null;
  amp_model: string | null;
  gain: number | null;
  bass: number | null;
  mid: number | null;
  treble: number | null;
  presence: number | null;
  tuning: string | null;
  guitar_type: string | null;
  pickup_position: string | null;
  play_style: string | null;
  tightness: number | null;
  clarity: number | null;
  noise_level: number | null;
  amp_style: string | null;
};

export async function updateTone(
  id: string,
  updates: ToneCardDbUpdate,
): Promise<ToneCard | null> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase env vars are not configured.');
    return null;
  }

  const { data, error } = await supabase
    .from('tones')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return rowToToneCard(data as DbToneRow);
}

export async function deleteTone(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase env vars are not configured.');
    return false;
  }

  const { error } = await supabase.from('tones').delete().eq('id', id);

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}

export async function toggleFavorite(
  toneId: string,
  currentlyFavorite: boolean,
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase env vars are not configured.');
    return false;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  if (currentlyFavorite) {
    const { error } = await supabase
      .from('tone_favorites')
      .delete()
      .eq('tone_id', toneId)
      .eq('user_id', user.id);
    if (error) {
      console.error(error);
      return false;
    }
    return true;
  }

  const { error } = await supabase.from('tone_favorites').insert({
    tone_id: toneId,
    user_id: user.id,
  });

  if (error) {
    console.error(error);
    return false;
  }
  return true;
}

export async function uploadNamFile(
  file: File,
  userId: string,
): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase env vars are not configured.');
    return null;
  }

  const path = `${userId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from('nam-files').upload(path, file);

  if (error) {
    console.error(error);
    return null;
  }

  const { data: pub } = supabase.storage.from('nam-files').getPublicUrl(data.path);
  return pub.publicUrl;
}

export async function uploadIrFile(
  file: File,
  userId: string,
): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase env vars are not configured.');
    return null;
  }

  const path = `${userId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from('ir-files').upload(path, file);

  if (error) {
    console.error(error);
    return null;
  }

  const { data: pub } = supabase.storage.from('ir-files').getPublicUrl(data.path);
  return pub.publicUrl;
}
