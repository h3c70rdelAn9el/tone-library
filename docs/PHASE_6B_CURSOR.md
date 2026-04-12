# 🎸 ToneVault — Phase 6b Cursor Instructions

## Guest Mode + Sign In Button

## Goal

Unauthenticated users land on the full app loaded with mock tone data. They can browse, explore the amp UI, and see how everything works. A small "Sign in with Google" button floats in the top-right corner. Once signed in, mock data disappears and their real personal library loads. No separate login page needed.

---

## No New Dependencies

Everything is already installed.

---

## How Guest vs Auth Mode Works

```
Not signed in:
  → Full app UI visible
  → Tones loaded from mockTones.ts (local only)
  → Top-right: "Sign in with Google" button
  → Upload, Delete, Favorite are disabled with a tooltip: "Sign in to save tones"
  → Sync status shows: "Guest mode"

Signed in:
  → mockTones replaced by user's real Supabase tones
  → Top-right: user avatar + name
  → All features enabled
  → Sync status shows: "Synced" or "Local only"
```

---

## File Structure Changes

```
src/
├── context/
│   └── AuthContext.tsx           ← unchanged from Phase 6
├── components/
│   ├── TopBar.tsx                ← NEW: top-right sign in button or user menu
│   ├── UserMenu.tsx              ← updated: also used inside TopBar when signed in
│   └── Sidebar.tsx               ← updated: remove UserMenu from bottom, add TopBar reference
├── hooks/
│   └── useTones.ts               ← updated: returns mockTones if guest, Supabase tones if authed
├── pages/
│   ├── LibraryPage.tsx           ← updated: includes TopBar, guest-aware actions
│   ├── UploadPage.tsx            ← updated: disabled with message if guest
│   └── FavoritesPage.tsx         ← updated: shows mock favorites if guest
├── store/
│   └── useToneStore.ts           ← updated: seed with mockTones when no user present
└── App.tsx                       ← updated: no more ProtectedRoute wrapping main pages
```

---

## Updated: `App.tsx`

Remove ProtectedRoute from main routes. All routes are now public:

```
/                   → LibraryPage (guest or authed)
/favorites          → FavoritesPage (guest or authed)
/upload             → UploadPage (guest sees disabled state)
/tone/:id           → ToneDetailPage (guest sees read-only state)
/auth/callback      → AuthCallbackPage
```

Delete LoginPage route entirely — there is no standalone login page anymore.

---

## Updated: `src/hooks/useTones.ts`

- Get `user` from `useAuth()`
- If `user` is null (guest): return mockTones directly, skip all Supabase calls, set `syncStatus` to `'guest'`
- If `user` exists: fetch from Supabase as normal
- On sign in: automatically re-fetch from Supabase (useEffect dependency on `user`)
- On sign out: revert to mockTones, clear Zustand store

---

## Updated: `src/store/useToneStore.ts`

- On init with no user: seed store with mockTones
- Add `isGuest: boolean` derived from whether user is null
- Add `syncStatus` value: `'guest'` in addition to existing `'synced' | 'local' | 'error'`
- On sign in: call `clearStore()` then let useTones refetch and repopulate

---

## `src/components/TopBar.tsx`

Thin bar that sits at the top-right of the main content area. Not a full-width header — just a floating element pinned top-right.

### Guest state:

- Button: "Sign in with Google"
- Style: small, pill-shaped, `bg-brand-accent text-black font-display uppercase text-xs tracking-widest`
- Google icon inline (simple SVG G logo) to the left of text
- On click: `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth/callback' } })`
- Subtle pulsing ring animation around the button to draw attention

### Signed in state:

- Show user avatar (circular, 32px)
- Show first name next to avatar
- Small LogOut icon button next to name
- On logout: `supabase.auth.signOut()` then reload tones with mock data

### Positioning:

- `fixed top-4 right-4 z-50` so it floats above all content
- Does not affect layout of anything below it

---

## Updated: `src/pages/LibraryPage.tsx`

- Import and render `<TopBar />` at the top of the page (it positions itself fixed)
- No other changes to layout
- Tone count subheading: if guest show "6 demo tones" instead of "6 tones"

---

## Updated: `src/pages/UploadPage.tsx`

If guest (`isGuest === true`):

- Render the full form UI so they can see it
- All inputs are disabled (`disabled` prop)
- Show a banner at top of form:
  - Text: "Sign in with Google to save your tones"
  - Button: "Sign in" — same style as TopBar button
  - Background: subtle `bg-brand-accent/10 border border-brand-accent/30`
- Save button: disabled, shows "Sign in to save" instead of "Save Tone"

If signed in: form works normally as before.

---

## Updated: `src/pages/ToneDetailPage.tsx`

If guest:

- Show tone detail normally (read-only view of mock tone)
- Hide Edit, Delete, Favorite buttons
- Show small text below: "Sign in to manage your tones"

If signed in: all buttons work normally.

---

## Updated: `src/components/Sidebar.tsx`

- Remove UserMenu from sidebar bottom entirely
- Replace with just the sync status indicator
- UserMenu/auth is now handled by TopBar only
- Sidebar footer: show `'Guest mode'` in amber when not signed in

---

## Sync Status Values (update Sidebar indicator)

| Status     | Dot color   | Label      |
| ---------- | ----------- | ---------- |
| `'synced'` | green-400   | Synced     |
| `'local'`  | amber-400   | Local only |
| `'error'`  | red-400     | Offline    |
| `'guest'`  | brand-muted | Guest mode |

---

## Sign In Flow (end to end)

```
User lands on app
→ Sees full UI with mock tones + amp
→ Notices "Sign in with Google" button top-right (pulsing)
→ Clicks it
→ Google OAuth popup / redirect
→ Returns to /auth/callback
→ Session established
→ useTones detects user, fetches from Supabase
→ Mock data replaced with real library (empty at first)
→ TopBar shows avatar + name
→ Sidebar shows "Synced"
→ Upload now works
```

---

## Mock Tones Behavior

- mockTones are never sent to Supabase — they only exist in memory for guests
- If a guest clicks a mock tone's detail page, it reads from the local mockTones array
- Mock tones do not have real file URLs — Download buttons show "Sign in to download"
- Favorite toggling on mock tones works visually (local state only, not persisted)

---

## Design Rules

- TopBar button should feel like a gentle nudge, not an aggressive CTA
- The pulsing ring: subtle, slow (2s animation), accent color at low opacity
- Guest mode never feels broken — the app looks fully functional
- Transition from guest → signed in should feel instant and smooth
