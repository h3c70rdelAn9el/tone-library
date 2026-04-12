# 🎸 Tone Library — Phase 6 Complete
## Google Auth + Guest Mode

## Goal
Two things in one phase:
1. Real Google OAuth via Supabase Auth — users sign in, get their own private library
2. Guest mode — unauthenticated users see the full app with mock data, a floating "Sign in with Google" button nudges them to sign up

---

## Manual Steps (do these BEFORE running Cursor)

### 1. Google OAuth Setup
1. Go to https://console.cloud.google.com
2. Create a new project or use existing
3. Go to APIs & Services → Credentials
4. Click "Create Credentials" → OAuth 2.0 Client ID
5. Application type: **Web application**
6. Add Authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:5173/auth/callback`
   - `https://your-vercel-app.vercel.app/auth/callback`
7. Copy Client ID and Client Secret

### 2. Enable Google in Supabase
1. Go to Supabase → Authentication → Providers
2. Enable Google
3. Paste Client ID and Client Secret
4. Save

### 3. Supabase URL Configuration
1. Go to Supabase → Authentication → URL Configuration
2. Site URL: `https://your-vercel-app.vercel.app`
3. Redirect URLs — add all of these:
   - `http://localhost:5173/auth/callback`
   - `https://your-vercel-app.vercel.app/auth/callback`

### 4. Run SQL in Supabase SQL Editor

```sql
-- Add user_id to tones
alter table tones
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Enable Row Level Security
alter table tones enable row level security;

-- Policies
create policy "Users can view own tones"
  on tones for select
  using (auth.uid() = user_id);

create policy "Users can insert own tones"
  on tones for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tones"
  on tones for update
  using (auth.uid() = user_id);

create policy "Users can delete own tones"
  on tones for delete
  using (auth.uid() = user_id);

-- Storage policies: NAM files
create policy "Users can upload nam files"
  on storage.objects for insert
  with check (bucket_id = 'nam-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read own nam files"
  on storage.objects for select
  using (bucket_id = 'nam-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own nam files"
  on storage.objects for delete
  using (bucket_id = 'nam-files' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies: IR files
create policy "Users can upload ir files"
  on storage.objects for insert
  with check (bucket_id = 'ir-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read own ir files"
  on storage.objects for select
  using (bucket_id = 'ir-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own ir files"
  on storage.objects for delete
  using (bucket_id = 'ir-files' and auth.uid()::text = (storage.foldername(name))[1]);
```

### 5. Add to .env
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SITE_URL=http://localhost:5173
```

---

## New Dependencies to Install

```bash
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

---

## File Structure

```
src/
├── context/
│   └── AuthContext.tsx           ← NEW: auth state provider
├── components/
│   ├── TopBar.tsx                ← NEW: floating sign in button or user avatar
│   ├── UserMenu.tsx              ← NEW: avatar + name + logout
│   └── Sidebar.tsx               ← updated: sync status only, no user menu
├── hooks/
│   └── useTones.ts               ← updated: guest returns mockTones, authed returns Supabase
├── pages/
│   ├── AuthCallbackPage.tsx      ← NEW: handles OAuth redirect
│   ├── LibraryPage.tsx           ← updated: includes TopBar
│   ├── UploadPage.tsx            ← updated: disabled for guests
│   ├── FavoritesPage.tsx         ← updated: works for both guest and authed
│   └── ToneDetailPage.tsx        ← updated: read-only for guests
├── services/
│   └── toneService.ts            ← updated: user_id in insert, user folder in storage
├── store/
│   └── useToneStore.ts           ← updated: guest mode seed + clearStore on logout
└── App.tsx                       ← updated: auth callback route, no ProtectedRoute
```

---

## `src/context/AuthContext.tsx`

Create React context that:
- On mount: calls `supabase.auth.getSession()` to restore existing session
- Listens to `supabase.auth.onAuthStateChange()` for login/logout events
- Stores `session`, `user` in state
- `loading` is true until initial session check resolves
- Exposes `{ user, session, loading, signInWithGoogle, signOut }`
- `signInWithGoogle`: calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth/callback' } })`
- `signOut`: calls `supabase.auth.signOut()` then calls `clearStore()` from Zustand
- Export `useAuth()` hook
- Wrap entire app in `<AuthProvider>` inside `main.tsx`

---

## `src/pages/AuthCallbackPage.tsx`

Handles the redirect back from Google OAuth.

- On mount: call `supabase.auth.exchangeCodeForSession(window.location.href)`
- On success: navigate to `/`
- On error: navigate to `/` anyway (guest mode is fine as fallback)
- While processing: show centered spinner with "Signing you in..." in font-mono muted text
- Full screen dark background matching brand-bg

Route: `/auth/callback`

---

## `src/components/TopBar.tsx`

Floating element, fixed position top-right. Does not affect page layout.

Position: `fixed top-4 right-4 z-50`

### Guest state (no user):
- Pill button: Google SVG icon + "Sign in with Google"
- Style: `bg-brand-accent text-black font-display uppercase text-xs tracking-widest px-4 py-2 rounded-full`
- Pulsing ring animation: `box-shadow` keyframe at 2s infinite, accent color low opacity
- On click: call `signInWithGoogle()` from useAuth()

### Signed in state:
- User avatar: circular 32px image from `user.user_metadata.avatar_url`
- Fallback avatar: circle with first letter of name, `bg-brand-accent text-black`
- First name text next to avatar
- LogOut icon button (lucide-react) — on click: call `signOut()` from useAuth()
- Style: `bg-brand-card border border-brand-border rounded-full px-3 py-1.5 flex items-center gap-2`

---

## `src/components/UserMenu.tsx`

Used inside TopBar signed-in state. Props: `user: User`

Shows:
- Avatar (with fallback)
- First name (parsed from `user.user_metadata.full_name`)
- LogOut button

---

## Updated: `src/hooks/useTones.ts`

- Get `user` from `useAuth()`
- If `user` is null: return mockTones immediately, skip Supabase, set syncStatus `'guest'`
- If `user` exists: fetch from Supabase as normal
- useEffect dependency includes `user` — re-fetches automatically on sign in
- On sign out: store clears and falls back to mockTones

---

## Updated: `src/store/useToneStore.ts`

Add:
- `isGuest: boolean` — true when no user
- `syncStatus`: add `'guest'` as valid value
- `clearStore()` action — resets tones array, clears localStorage persistence
- On init with no user: seed tones with mockTones data

---

## Updated: `src/services/toneService.ts`

### `createTone(tone, userId: string)`
- Add `user_id: userId` to insert payload

### `uploadNamFile(file: File, userId: string)`
- File path: `${userId}/${Date.now()}-${file.name}`

### `uploadIrFile(file: File, userId: string)`
- File path: `${userId}/${Date.now()}-${file.name}`

All other functions unchanged — RLS handles scoping automatically.

---

## Updated: `src/pages/LibraryPage.tsx`

- Render `<TopBar />` (it positions itself, no layout impact)
- Tone count: if guest show "6 demo tones", if authed show real count
- No other changes

---

## Updated: `src/pages/UploadPage.tsx`

If guest:
- Render full form UI but all inputs are `disabled`
- Banner at top: `bg-brand-accent/10 border border-brand-accent/30 rounded-md p-4`
  - Text: "Sign in with Google to save your tones"
  - Inline sign in button
- Save button: disabled, label "Sign in to save"

If authed:
- Pass `user.id` to `createTone()` and file upload functions
- Works exactly as Phase 3

---

## Updated: `src/pages/ToneDetailPage.tsx`

If guest:
- Show full tone detail (read from mockTones)
- Hide Edit, Delete, Favorite action buttons
- Show: "Sign in to manage your tones" in muted text below tone info
- Download buttons show "Sign in to download"

If authed:
- All buttons and actions work normally

---

## Updated: `src/components/Sidebar.tsx`

- Remove any existing UserMenu from sidebar
- Auth is handled by TopBar only
- Sidebar footer sync status indicator:

| Status | Dot | Label |
|---|---|---|
| `'synced'` | green-400 | Synced |
| `'local'` | amber-400 | Local only |
| `'error'` | red-400 | Offline |
| `'guest'` | brand-muted | Guest mode |

---

## Updated: `App.tsx`

```
Routes (all public — no ProtectedRoute):
  /                   → LibraryPage
  /favorites          → FavoritesPage
  /upload             → UploadPage (guest sees disabled state)
  /tone/:id           → ToneDetailPage (guest sees read-only)
  /auth/callback      → AuthCallbackPage
```

Remove LoginPage entirely. Remove ProtectedRoute entirely.

---

## Guest Mode Behavior Summary

- mockTones never sent to Supabase — memory only
- Favorite toggling on mock tones: local visual state only, not persisted
- Mock tone Download buttons: show "Sign in to download"
- App feels fully functional — guest never hits a wall, just gentle nudges
- Transition from guest → signed in: instant, smooth, no full page reload

---

## Sign In Flow (end to end)

```
User lands on app
→ Full UI with 6 mock tones loaded
→ Amp displays first mock tone
→ "Sign in with Google" button pulses top-right
→ User clicks it
→ Google OAuth flow
→ Redirected to /auth/callback
→ Session established
→ AuthContext fires onAuthStateChange
→ useTones detects user, fetches from Supabase
→ Zustand clears mock data, loads real tones
→ TopBar switches to avatar + name
→ Sidebar shows "Synced"
→ All features unlocked
```

---

## Vercel Environment Variables
Make sure these are set in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_URL` (set to your Vercel URL)

Redeploy after adding env vars.
