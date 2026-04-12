# 🎸 ToneForge — Phase 1 Cursor Instructions

## Context

- React + Vite + **TypeScript** project
- Tailwind CSS v3 already installed
- Use `.tsx` for all components and pages, `.ts` for data files

---

## Stack Already Installed

- tailwindcss@3 + postcss + autoprefixer
- react-router-dom
- lucide-react
- clsx

---

## Tailwind Config

Update `tailwind.config.js` with this custom theme:

- Content paths: `./index.html` and `./src/**/*.{js,ts,jsx,tsx}`
- Extend colors under key `brand`:
  - `bg`: `#0d0d0f`
  - `surface`: `#16161a`
  - `card`: `#1c1c22`
  - `border`: `#2a2a35`
  - `accent`: `#e8ff47`
  - `accentDim`: `#b8cc2e`
  - `muted`: `#555566`
  - `text`: `#e8e8f0`
  - `subtext`: `#888899`
- Extend fontFamily:
  - `display`: Barlow Condensed
  - `body`: DM Sans
  - `mono`: JetBrains Mono

---

## index.css

- Import Google Fonts: Barlow Condensed (400, 600, 700, 800), DM Sans (300, 400, 500), JetBrains Mono (400, 500)
- Add Tailwind directives: base, components, utilities
- Set body: background `#0d0d0f`, color `#e8e8f0`, font DM Sans
- Style custom scrollbar: thin, dark track, dark thumb

---

## vite.config.ts

- Only use `@vitejs/plugin-react`
- No Tailwind vite plugin

---

## File Structure to Create

```
src/
├── data/
│   └── mockTones.ts
├── components/
│   ├── Sidebar.tsx
│   ├── ToneCard.tsx
│   ├── TagBadge.tsx
│   └── EmptyState.tsx
├── pages/
│   ├── LibraryPage.tsx
│   ├── UploadPage.tsx
│   └── ToneDetailPage.tsx
└── App.tsx  (replace existing)
```

---

## Data — `mockTones.ts`

Create a `Tone` type with fields:

- `id`: string
- `name`: string
- `tags`: string[]
- `notes`: string
- `namFile`: string
- `irFile`: string
- `createdAt`: string
- `favorite`: boolean

Create and export `mockTones` array with 6 entries covering genres: metal, clean, blues, ambient, djent, country. Give each a realistic name, notes describing the tone character, plausible `.nam` and `.wav` filenames, and varied tags.

---

## Components

### `TagBadge.tsx`

- Props: `tag: string`
- Small monospace pill
- Style: `bg-brand-border`, `text-brand-subtext`, uppercase, wide tracking, xs text

### `EmptyState.tsx`

- Props: `message?: string`
- Centered layout with a Guitar icon from lucide-react
- Muted text, large font-display uppercase label

### `ToneCard.tsx`

- Props: `tone: Tone`
- Clickable card navigating to `/tone/:id` via useNavigate
- Shows: name (font-display, uppercase), favorite star if applicable, truncated notes, NAM filename with FileAudio icon, IR filename with Mic2 icon, tag badges
- Hover: accent border tint, accent text on name
- Style: `bg-brand-card`, `border-brand-border`, rounded-lg

### `Sidebar.tsx`

- Sticky full-height sidebar, `w-56`, `bg-brand-surface`, right border
- Logo: Guitar icon + "ToneLib" in font-display uppercase
- Nav links: Library (`/`) and Add Tone (`/upload`) using NavLink
- Active link: accent color + accent background tint
- Footer: "Phase 1 — Local" in mono muted text
- Icons: Library, Upload from lucide-react

---

## Pages

### `LibraryPage.tsx`

- Heading: "ToneForge" font-display bold uppercase, subtext showing tone count
- Search input with Search icon — filters by name and notes
- Tag filter buttons — "All" + all unique tags from mock data — toggle active tag
- Active filter button: `bg-brand-accent text-black`
- Tone grid: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4`
- Show EmptyState when no results

### `UploadPage.tsx`

- Heading: "Add Tone"
- Form fields (no HTML `<form>` submit — use button onClick):
  - Text input: Tone Name (required)
  - Textarea: Notes
  - Tag toggle buttons (same style as library filters)
  - File upload placeholder div (dashed border, muted text "File upload coming in Phase 2")
- Save button: `bg-brand-accent text-black font-display uppercase`
- Cancel button: navigates back to `/`
- On save: show alert saying file would be saved in Phase 2, then navigate to `/`

### `ToneDetailPage.tsx`

- Read `:id` from URL params, find tone in mockTones
- Back button with ArrowLeft icon
- Large font-display title (uppercase, 5xl), favorite star if applicable
- Created date in mono muted text
- Tag badges row
- Notes block: dark card with label + body text
- Files block: dark card listing NAM file (FileAudio icon) and IR file (Mic2 icon), each with a Download button (non-functional in Phase 1)
- Action buttons: Edit (Pencil icon), Delete (Trash2 icon, red tint)
- Show fallback message if tone ID not found

---

## `App.tsx`

- Wrap everything in BrowserRouter
- Flex layout: Sidebar on left (fixed width), main content area scrollable on right
- Routes:
  - `/` → LibraryPage
  - `/upload` → UploadPage
  - `/tone/:id` → ToneDetailPage

---

## Design Rules

- Background: `bg-brand-bg` (`#0d0d0f`)
- Cards: `bg-brand-card` with `border-brand-border`
- Accent color `#e8ff47` used for: active states, icons, save buttons, hover highlights
- All headings: `font-display` (Barlow Condensed), uppercase, wide tracking
- All filenames and tags: `font-mono` (JetBrains Mono)
- Body text: DM Sans
- No light backgrounds anywhere — fully dark UI throughout
