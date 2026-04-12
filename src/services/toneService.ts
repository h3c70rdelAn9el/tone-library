import supabase, { isSupabaseConfigured } from '../lib/supabase';
import { mockTones } from '../data/mockTones';

// Toggle this flag to switch between mock data and Supabase
export const USE_MOCK_DATA = false;
import type { AmpStyle, Tone } from '../types/tone';

function parseAmpStyle(raw: string | null | undefined): AmpStyle | null {
  if (raw == null || raw === '') return null;
  const allowed: AmpStyle[] = ['modern-black', 'vintage-cream', 'british-gold', 'custom-dark'];
  return (allowed as string[]).includes(raw) ? (raw as AmpStyle) : null;
}

type DbToneRow = {
  id: string;
  name: string;
  tags: string[] | null;
  notes: string | null;
  nam_file: string | null;
  ir_file: string | null;
  nam_file_url: string | null;
  ir_file_url: string | null;
  favorite: boolean | null;
  amp_style?: string | null;
  created_at: string;
};

function rowToTone(row: DbToneRow): Tone {
  const created = row.created_at;
  const dateOnly = created.length >= 10 ? created.slice(0, 10) : (created.split('T')[0] ?? created);
  return {
    id: row.id,
    name: row.name,
    tags: row.tags ?? [],
    notes: row.notes ?? '',
    namFile: row.nam_file ?? '',
    irFile: row.ir_file ?? '',
    namFileURL: row.nam_file_url,
    irFileURL: row.ir_file_url,
    favorite: row.favorite ?? false,
    ampStyle: parseAmpStyle(row.amp_style),
    createdAt: dateOnly,
  };
}

/** Returns null when the request failed. Empty array means no rows. */
export async function tryFetchAllTones(): Promise<Tone[] | null> {
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
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return null;
  }

  return ((data ?? []) as DbToneRow[]).map(rowToTone);
}

export async function fetchAllTones(): Promise<Tone[]> {
  const tones = await tryFetchAllTones();
  return tones ?? [];
}

/** Client-side filter when Supabase search is unavailable. */
export function filterTonesLocally(
  tones: Tone[],
  query: string,
  tags: string[],
  favoritesOnly: boolean,
): Tone[] {
  const q = query.trim().toLowerCase();
  return tones.filter((tone) => {
    if (favoritesOnly && !tone.favorite) return false;
    if (tags.length > 0 && !tags.every((t) => tone.tags.includes(t))) {
      return false;
    }
    if (q) {
      const hay = `${tone.name} ${tone.notes} ${tone.tags.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Returns null on request failure (same as tryFetchAllTones). */
export async function trySearchTones(
  query: string,
  tags: string[],
  favoritesOnly: boolean,
): Promise<Tone[] | null> {
  if (USE_MOCK_DATA) {
    return filterTonesLocally(mockTones, query, tags, favoritesOnly);
  }
  if (!isSupabaseConfigured()) {
    return null;
  }

  let q = supabase.from('tones').select('*').order('created_at', { ascending: false });

  if (query.trim()) {
    q = q.textSearch('search_vector', query.trim(), {
      type: 'plain',
      config: 'english',
    });
  }
  if (tags.length > 0) {
    q = q.contains('tags', tags);
  }
  if (favoritesOnly) {
    q = q.eq('favorite', true);
  }

  const { data, error } = await q;

  if (error) {
    console.error(error);
    return null;
  }

  return ((data ?? []) as DbToneRow[]).map(rowToTone);
}

export async function searchTones(
  query: string,
  tags: string[],
  favoritesOnly: boolean,
): Promise<Tone[]> {
  const r = await trySearchTones(query, tags, favoritesOnly);
  return r ?? [];
}

export async function fetchAllTags(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase.from('tones').select('tags');

  if (error) {
    console.error(error);
    return [];
  }

  const set = new Set<string>();
  for (const row of data ?? []) {
    const tags = (row as { tags: string[] | null }).tags;
    if (tags) {
      for (const t of tags) set.add(t);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export async function createTone(tone: Omit<Tone, 'id' | 'createdAt'>): Promise<Tone | null> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase env vars are not configured.');
    return null;
  }

  const insert = {
    name: tone.name,
    tags: tone.tags,
    notes: tone.notes || null,
    nam_file: tone.namFile || null,
    ir_file: tone.irFile || null,
    nam_file_url: tone.namFileURL,
    ir_file_url: tone.irFileURL,
    favorite: tone.favorite,
    amp_style: tone.ampStyle ?? 'modern-black',
  };

  const { data, error } = await supabase.from('tones').insert(insert).select().single();

  if (error) {
    console.error(error);
    return null;
  }

  return rowToTone(data as DbToneRow);
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

export async function toggleFavorite(id: string, current: boolean): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase env vars are not configured.');
    return false;
  }

  const { error } = await supabase.from('tones').update({ favorite: !current }).eq('id', id);

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}

export async function uploadNamFile(file: File): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase env vars are not configured.');
    return null;
  }

  const path = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from('nam-files').upload(path, file);

  if (error) {
    console.error(error);
    return null;
  }

  const { data: pub } = supabase.storage.from('nam-files').getPublicUrl(data.path);
  return pub.publicUrl;
}

export async function uploadIrFile(file: File): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase env vars are not configured.');
    return null;
  }

  const path = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from('ir-files').upload(path, file);

  if (error) {
    console.error(error);
    return null;
  }

  const { data: pub } = supabase.storage.from('ir-files').getPublicUrl(data.path);
  return pub.publicUrl;
}
