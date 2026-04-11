import supabase, { isSupabaseConfigured } from '../lib/supabase';
import type { Tone } from '../types/tone';

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
  created_at: string;
};

function rowToTone(row: DbToneRow): Tone {
  const created = row.created_at;
  const dateOnly =
    created.length >= 10 ? created.slice(0, 10) : created.split('T')[0] ?? created;
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
    createdAt: dateOnly,
  };
}

/** Returns null when the request failed. Empty array means no rows. */
export async function tryFetchAllTones(): Promise<Tone[] | null> {
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

export async function createTone(
  tone: Omit<Tone, 'id' | 'createdAt'>,
): Promise<Tone | null> {
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
  };

  const { data, error } = await supabase
    .from('tones')
    .insert(insert)
    .select()
    .single();

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

export async function toggleFavorite(
  id: string,
  current: boolean,
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase env vars are not configured.');
    return false;
  }

  const { error } = await supabase
    .from('tones')
    .update({ favorite: !current })
    .eq('id', id);

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
  const { data, error } = await supabase.storage
    .from('nam-files')
    .upload(path, file);

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
  const { data, error } = await supabase.storage
    .from('ir-files')
    .upload(path, file);

  if (error) {
    console.error(error);
    return null;
  }

  const { data: pub } = supabase.storage.from('ir-files').getPublicUrl(data.path);
  return pub.publicUrl;
}
