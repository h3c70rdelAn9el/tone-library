# 🎸 Tone Library — Phase 2 Cursor Instructions

## Goal
Wire up real data. Tones created in the Upload form should persist, survive refresh, and be deletable and favoriteable. No backend yet — everything lives in Zustand + localStorage.

---

## New Dependencies to Install

```bash
npm install zustand uuid
npm install -D @types/uuid
```

---

## What Changes in Phase 2

| Feature | Phase 1 | Phase 2 |
|---|---|---|
| Tone data | Static mock array | Zustand store |
| Add tone | Alert placeholder | Actually creates entry |
| Delete tone | Non-functional button | Removes from store |
| Favorite | Display only | Toggle persists |
| File upload | Placeholder div | Real file input, local object URL |
| Refresh survival | Lost | localStorage persistence |

---

## File Structure Changes

```
src/
├── store/
│   └── useToneStore.ts        ← NEW: Zustand store
├── types/
│   └── tone.ts                ← NEW: shared Tone type
├── data/
│   └── mockTones.ts           ← KEEP: used to seed store on first load
├── components/
│   ├── Sidebar.tsx            ← unchanged
│   ├── ToneCard.tsx           ← minor: favorite toggle button added
│   ├── TagBadge.tsx           ← unchanged
│   └── EmptyState.tsx         ← unchanged
├── pages/
│   ├── LibraryPage.tsx        ← updated: reads from store
│   ├── UploadPage.tsx         ← updated: writes to store, real file input
│   └── ToneDetailPage.tsx     ← updated: delete + favorite wired up
└── App.tsx                    ← unchanged
```

---

## Types — `src/types/tone.ts`

Move the `Tone` type here so it's shared across store and components.

Fields (same as Phase 1 plus two new ones):
- `id`: string
- `name`: string
- `tags`: string[]
- `notes`: string
- `namFile`: string — now stores filename string OR local object URL
- `irFile`: string — same
- `namFileURL`: string | null — blob URL for local file access
- `irFileURL`: string | null — blob URL for local file access
- `createdAt`: string
- `favorite`: boolean

---

## Store — `src/store/useToneStore.ts`

Use Zustand. Persist the store to localStorage using Zustand's built-in `persist` middleware.

Store state:
- `tones`: Tone[] — starts seeded from mockTones on first load (check localStorage first; only seed if empty)

Store actions:
- `addTone(tone: Tone)` — prepends to tones array
- `deleteTone(id: string)` — removes by id
- `toggleFavorite(id: string)` — flips the favorite boolean
- `getToneById(id: string)` — returns single tone or undefined

Persistence:
- Use Zustand `persist` middleware
- Storage key: `"tone-library"`
- Only persist the `tones` array, not any derived state

Seeding logic:
- On store initialization, if localStorage has no tones yet, seed with the mockTones data

---

## Updated: `UploadPage.tsx`

Replace the placeholder form with a fully working one.

Form fields:
- Text input: Tone Name (required)
- Textarea: Notes
- Tag toggles: same pill button style as Phase 1
- File input for NAM file: accepts `.nam` files only
  - Show selected filename below input once chosen
  - Store as local object URL via `URL.createObjectURL()`
- File input for IR file: accepts `.wav` files only
  - Same treatment as NAM input
- Favorite checkbox or toggle

On save:
- Generate a new `id` using `uuid`
- Set `createdAt` to today's date (ISO string, date portion only)
- Call `addTone()` from the store
- Navigate to `/` after saving

Validation:
- Name is required — show inline error if empty on submit
- All other fields optional

File input styling:
- Hidden native input, styled clickable label area
- Show filename after selection in mono muted text
- Dashed border, accent color on hover

---

## Updated: `ToneDetailPage.tsx`

Read tone from store via `getToneById(id)` instead of mockTones array.

Wire up Delete button:
- Call `deleteTone(id)` from store
- Navigate back to `/` after deletion
- Show a confirmation before deleting (simple `window.confirm`)

Wire up Favorite button:
- Call `toggleFavorite(id)` from store
- Star icon should reflect live state (filled if favorite, outline if not)
- Button should be clickable directly on the detail page

If NAM or IR file has a blob URL (`namFileURL` / `irFileURL`):
- Download button creates a temporary `<a>` element with the blob URL and triggers click
- Otherwise show "No file attached" in muted text

---

## Updated: `LibraryPage.tsx`

- Read `tones` from `useToneStore` instead of importing mockTones directly
- Everything else (search, filter, grid) works the same
- Tone count in subheading reflects live store length

---

## Updated: `ToneCard.tsx`

- Add a small favorite toggle button (star icon) directly on the card
- Clicking star calls `toggleFavorite(id)` from store
- Stop event propagation on star click so it doesn't navigate to detail page

---

## Design Rules (carry over from Phase 1)
- No new colors introduced
- File inputs styled dark, consistent with existing card style
- Error states use red-400 text, no background
- All new text follows existing font conventions (mono for filenames, display for headings)
