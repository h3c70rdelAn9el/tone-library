# 🎸 ToneVault — Phase 4 Cursor Instructions

## Goal

Add power features: advanced search, tag management, favorites view, and full Vercel deployment. The app should be production-ready and deployable with one command after this phase.

---

## No New Dependencies

Everything needed is already installed. No new npm packages required.

---

## File Structure Changes

```
src/
├── lib/
│   └── supabase.ts               ← unchanged
├── services/
│   └── toneService.ts            ← updated: add search + tag queries
├── store/
│   └── useToneStore.ts           ← updated: add filter state
├── hooks/
│   ├── useTones.ts               ← updated: accepts filter params
│   └── useTagList.ts             ← NEW: derives unique tag list from tones
├── components/
│   ├── Sidebar.tsx               ← updated: favorites link + tone count badges
│   ├── ToneCard.tsx              ← unchanged
│   ├── TagBadge.tsx              ← updated: optional onClick prop
│   ├── EmptyState.tsx            ← unchanged
│   ├── LoadingState.tsx          ← unchanged
│   └── SearchBar.tsx             ← NEW: extracted search component
├── pages/
│   ├── LibraryPage.tsx           ← updated: full filter/search wired to Supabase
│   ├── FavoritesPage.tsx         ← NEW: filtered view of favorite tones
│   ├── UploadPage.tsx            ← updated: custom tag input added
│   └── ToneDetailPage.tsx        ← updated: click tag to filter library
└── App.tsx                       ← updated: add /favorites route
```

---

## Vercel Deploy Files (create these at project root)

### `vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This ensures React Router works correctly on Vercel — all routes serve `index.html`.

### `.env.example`

Create this file (safe to commit — no real values):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### `.gitignore` check

Make sure `.env` is listed. Add if missing.

---

## Supabase: Add Full-Text Search (run in SQL Editor)

```sql
alter table tones add column if not exists search_vector tsvector
  generated always as (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(notes, '') || ' ' || array_to_string(tags, ' '))
  ) stored;

create index if not exists tones_search_idx on tones using gin(search_vector);
```

This enables fast full-text search on name, notes, and tags server-side.

---

## Updated: `src/services/toneService.ts`

Add two new functions:

### `searchTones(query: string, tags: string[], favoritesOnly: boolean): Promise<Tone[]>`

- If query is non-empty: filter using `search_vector @@ plainto_tsquery('english', query)` via `.textSearch()`
- If tags array is non-empty: filter using `.contains('tags', tags)`
- If favoritesOnly: filter using `.eq('favorite', true)`
- All filters are combinable (chain them)
- Order by `created_at` descending
- On error: log and return empty array

### `fetchAllTags(): Promise<string[]>`

- Select only the `tags` column from all tones
- Flatten and deduplicate the array
- Return sorted unique tag list
- On error: return empty array

---

## `src/hooks/useTagList.ts`

Custom hook:

- Calls `fetchAllTags()` on mount
- Returns `{ tags: string[], loading: boolean }`
- Tags are used to populate filter UI dynamically (no more hardcoded tag list)

---

## Updated: `src/hooks/useTones.ts`

Accept optional params: `{ query?: string, tags?: string[], favoritesOnly?: boolean }`

- If any param is set: call `searchTones()` instead of `fetchAllTones()`
- If no params: call `fetchAllTones()` as before
- Re-fetch whenever params change (useEffect dependency array)
- Keep same loading/error/fallback behavior from Phase 3

---

## Updated: `src/store/useToneStore.ts`

Add filter state:

- `searchQuery`: string — default `''`
- `activeTags`: string[] — default `[]`
- `favoritesOnly`: boolean — default `false`

Add actions:

- `setSearchQuery(q: string)`
- `setActiveTags(tags: string[])`
- `toggleActiveTag(tag: string)` — adds if not present, removes if present
- `setFavoritesOnly(val: boolean)`
- `clearFilters()` — resets all three to defaults

---

## `src/components/SearchBar.tsx`

Extract the search input from LibraryPage into its own component.

Props:

- `value: string`
- `onChange: (val: string) => void`
- `placeholder?: string`

Features:

- Search icon on left (Lucide `Search`)
- Clear button (X icon) on right — only visible when value is non-empty
- Clicking X clears the input and calls onChange with `''`
- Same styling as Phase 1 search input

---

## Updated: `src/components/TagBadge.tsx`

Add optional `onClick?: () => void` prop.
When provided: render as a clickable button with hover state.
When not provided: render as a plain span (existing behavior).

---

## Updated: `src/components/Sidebar.tsx`

Add:

- Favorites nav link → `/favorites` with Star icon from lucide-react
- Below each nav label, show a small count badge:
  - Library: total tone count
  - Favorites: count of tones where `favorite === true`
- Read counts from Zustand store
- Active link style unchanged

---

## `src/pages/FavoritesPage.tsx`

- Same layout as LibraryPage
- Heading: "Favorites" with star icon inline
- Calls `useTones({ favoritesOnly: true })`
- Shows LoadingState while fetching
- Shows EmptyState with message "No favorites yet — star a tone to save it here" if empty
- No tag filter UI needed — keep it simple
- Search bar still present (searches within favorites only)

---

## Updated: `src/pages/LibraryPage.tsx`

- Read `searchQuery`, `activeTags` from Zustand store
- Pass them to `useTones({ query: searchQuery, tags: activeTags })`
- SearchBar now uses `setSearchQuery` from store
- Tag filter buttons use `toggleActiveTag` from store
- Tags list comes from `useTagList()` hook (dynamic, not hardcoded)
- Add "Clear filters" button — visible only when any filter is active, calls `clearFilters()`
- Tone count in subheading shows filtered count vs total: e.g. "12 of 24 tones"

---

## Updated: `src/pages/UploadPage.tsx`

Add custom tag input:

- Text input where user types a tag and presses Enter or comma to add it
- Added tags appear as removable pills above the input
- Existing preset tag toggles stay — clicking a preset adds it to the same tags array
- No duplicate tags allowed
- Tag pills: same TagBadge style with an X button to remove

---

## Updated: `src/pages/ToneDetailPage.tsx`

- Each TagBadge on the detail page is now clickable
- Clicking a tag navigates to `/` and sets that tag as the active filter via `toggleActiveTag()`
- User lands on LibraryPage already filtered to that tag

---

## Updated: `App.tsx`

Add route:

- `/favorites` → FavoritesPage

---

## Vercel Deployment Instructions (include as a comment block or README section)

### Pre-deploy checklist:

1. Push code to GitHub
2. Go to https://vercel.com and import the repo
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy

### Supabase CORS (do this before deploying):

- Go to Supabase → Project Settings → API
- Add your Vercel domain to the allowed origins list once you have it
- Format: `https://your-app.vercel.app`

### After deploy:

- Every push to `main` auto-deploys via Vercel
- Environment variables are never exposed in the client bundle (Vite handles this safely with the VITE\_ prefix)

---

## Design Rules (carry over)

- No new colors, fonts, or spacing systems
- FavoritesPage matches LibraryPage layout exactly
- Tag input in UploadPage matches existing pill/badge style
- Count badges in Sidebar: small, rounded, `bg-brand-border text-brand-subtext` — subtle, not loud
