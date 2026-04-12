# 🎸 ToneForge — Phase 3 Cursor Instructions

## Goal

Connect the app to Supabase for real persistent storage. Tone metadata goes into Postgres. NAM and IR files go into Supabase Storage buckets. Zustand stays as a local cache and fallback layer. No auth yet — all data is public/anonymous for now.

---

## Step 1 — Create Supabase Project (do this manually before running Cursor)

1. Go to https://supabase.com and create a new project
2. Name it `ToneForge`
3. Choose a region close to you
4. Save your database password somewhere safe
5. Once created, go to **Project Settings → API**
6. Copy:
   - `Project URL`
   - `anon public` key

---

## Step 2 — Create the Database Table (run in Supabase SQL Editor)

```sql
create table tones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tags text[] default '{}',
  notes text,
  nam_file text,
  ir_file text,
  nam_file_url text,
  ir_file_url text,
  favorite boolean default false,
  created_at timestamp with time zone default now()
);
```

---

## Step 3 — Create Storage Buckets (do this in Supabase Dashboard)

1. Go to **Storage** in the Supabase sidebar
2. Create bucket: `nam-files` — set to Public
3. Create bucket: `ir-files` — set to Public

---

## Step 4 — Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Add `.env` to `.gitignore` if not already there.

---

## New Dependencies to Install

```bash
npm install @supabase/supabase-js
```

---

## File Structure Changes

```
src/
├── lib/
│   └── supabase.ts             ← NEW: Supabase client
├── services/
│   └── toneService.ts          ← NEW: all Supabase DB + storage calls
├── store/
│   └── useToneStore.ts         ← UPDATED: syncs with Supabase, keeps local fallback
├── hooks/
│   └── useTones.ts             ← NEW: data fetching hook with loading + error state
├── types/
│   └── tone.ts                 ← unchanged
├── components/
│   ├── ToneCard.tsx            ← unchanged
│   ├── Sidebar.tsx             ← unchanged
│   ├── TagBadge.tsx            ← unchanged
│   ├── EmptyState.tsx          ← unchanged
│   └── LoadingState.tsx        ← NEW: skeleton loader
├── pages/
│   ├── LibraryPage.tsx         ← updated: uses useTones hook
│   ├── UploadPage.tsx          ← updated: uploads files to Supabase Storage
│   └── ToneDetailPage.tsx      ← updated: delete + favorite hit Supabase
└── App.tsx                     ← unchanged
```

---

## `src/lib/supabase.ts`

- Initialize Supabase client using `createClient` from `@supabase/supabase-js`
- Use `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`
- Export the client as default `supabase`

---

## `src/services/toneService.ts`

All direct Supabase calls live here. No UI logic.

### `fetchAllTones(): Promise<Tone[]>`

- Query the `tones` table, order by `created_at` descending
- Map snake_case DB columns back to camelCase Tone type
- On error: log error and return empty array

### `createTone(tone: Omit<Tone, 'id' | 'createdAt'>): Promise<Tone | null>`

- Insert into `tones` table
- Map camelCase fields to snake_case for DB
- Return the created tone with id and created_at from DB
- On error: log and return null

### `deleteTone(id: string): Promise<boolean>`

- Delete from `tones` where id matches
- Return true on success, false on error

### `toggleFavorite(id: string, current: boolean): Promise<boolean>`

- Update `favorite` to `!current` where id matches
- Return true on success, false on error

### `uploadNamFile(file: File): Promise<string | null>`

- Upload to `nam-files` bucket
- Filename: `${Date.now()}-${file.name}` to avoid collisions
- Return the public URL from Supabase Storage
- On error: log and return null

### `uploadIrFile(file: File): Promise<string | null>`

- Same as above but targets `ir-files` bucket

---

## `src/hooks/useTones.ts`

Custom hook managing fetch lifecycle.

State:

- `tones`: Tone[] — starts from Zustand store immediately as cache
- `loading`: boolean
- `error`: string | null

On mount:

- Set loading true
- Call `fetchAllTones()` from toneService
- If successful: update local state and Zustand store, set `syncStatus` to `'synced'`
- If failed: keep Zustand local data, set error, set `syncStatus` to `'error'`
- Set loading false either way

Return: `{ tones, loading, error, refetch }`

Fallback: if Supabase fails, return whatever is in the Zustand store without blocking the UI.

---

## `src/store/useToneStore.ts` Updates

Keep all existing Phase 2 logic. Add:

- `setTones(tones: Tone[])` action — replaces entire array (called after successful Supabase fetch)
- `syncStatus`: `'synced' | 'local' | 'error'` field — defaults to `'local'`
- `setSyncStatus(status)` action

The store is now a cache. Supabase is the source of truth.

---

## `src/components/LoadingState.tsx`

Skeleton loader shown while fetching.

- Grid of 6 skeleton cards matching ToneCard dimensions
- Tailwind `animate-pulse` on all placeholder blocks
- Cards use `bg-brand-card` with rounded corners
- Placeholder blocks for: title, two lines of text, three tag pills
- Same grid layout as LibraryPage

---

## Updated: `LibraryPage.tsx`

- Replace store/mockTones reads with `useTones()` hook
- Show `LoadingState` while `loading` is true
- Show subtle dismissable top banner when in fallback mode: `"Supabase unavailable — showing local data"` in amber
- Search and filter logic unchanged

---

## Updated: `UploadPage.tsx`

On save (in this order):

1. Show "Uploading..." state, disable save button
2. Upload NAM file via `uploadNamFile()` → get public URL
3. Upload IR file via `uploadIrFile()` → get public URL
4. Call `createTone()` with all fields + file URLs
5. If Supabase succeeds: add to Zustand via `addTone()`, navigate to `/`
6. If Supabase fails: add to Zustand only, set `syncStatus` to `'local'`, navigate to `/`
7. On any error: show inline error message, re-enable form

---

## Updated: `ToneDetailPage.tsx`

Read tone from Zustand store by id (already cached).

Delete:

- `window.confirm` first
- Call `deleteTone(id)` from toneService
- On success: remove from Zustand store, navigate to `/`
- On failure: show inline error, stay on page

Favorite toggle:

- Call `toggleFavorite(id, tone.favorite)` from toneService
- On success: update Zustand store
- On failure: show brief inline error

File downloads:

- If URL is a Supabase public URL: open in new tab or trigger anchor download
- If URL is a local blob (Phase 2 legacy): use blob download logic

---

## Sync Status Indicator in Sidebar

Add to Sidebar footer below "Phase 3 — Supabase":

- `'synced'`: green dot + "Synced"
- `'local'`: amber dot + "Local only"
- `'error'`: red dot + "Offline"

Read from `useToneStore().syncStatus`. All text in font-mono muted style.

---

## Error Handling Philosophy

- Never show a full-page error for a Supabase failure
- Always fall back to Zustand silently or with a subtle banner
- Only block the UI for: catastrophic render errors
- `console.error` all Supabase failures for debugging

---

## Design Rules (carry over from Phase 1 + 2)

- Only new colors: green-400 (synced), amber-400 (local), red-400 (offline) for sync dot indicators
- Skeleton cards must match ToneCard dimensions exactly — no layout shift on load
- No new fonts or spacing systems introduced
