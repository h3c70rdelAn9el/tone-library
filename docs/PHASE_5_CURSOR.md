# 🎸 Tone Library — Phase 5 Redesign Cursor Instructions

## Goal
Complete UI redesign. Replace the dashboard layout with a responsive, immersive guitar amp experience. The selected tone is displayed as a realistic SVG amp with knobs, faceplate, and cabinet. Switching tones animates the amp in with a fade + scale effect. Sidebar collapses and opens on hover.

---

## New Dependencies to Install

```bash
npm install framer-motion
```

---

## New Field: `ampStyle` on Tone

### Update Supabase table (run in SQL Editor):
```sql
alter table tones add column if not exists amp_style text default 'modern-black';
```

Valid values: `'modern-black'` | `'vintage-cream'` | `'british-gold'` | `'custom-dark'`
Nullable — if null, default to `'modern-black'`

### Update `src/types/tone.ts`
Add field: `ampStyle?: 'modern-black' | 'vintage-cream' | 'british-gold' | 'custom-dark' | null`

### Update `src/services/toneService.ts`
- Include `amp_style` in all select queries, map to `ampStyle`
- Include `amp_style` in createTone insert, map from `ampStyle`

### Update `src/pages/UploadPage.tsx`
Add dropdown field labeled "Amp Style" with options:
- `modern-black` — Modern / High Gain
- `vintage-cream` — Vintage / Clean
- `british-gold` — British / Classic
- `custom-dark` — Custom / Dark

Default selection: `modern-black`. Field is optional (nullable).

---

## File Structure Changes

```
src/
├── components/
│   ├── Sidebar.tsx             ← REDESIGNED: collapsible, hover to expand
│   ├── AmpDisplay.tsx          ← NEW: full amp SVG with animation
│   ├── AmpHead.tsx             ← NEW: SVG amp head component
│   ├── AmpCabinet.tsx          ← NEW: SVG cabinet component
│   ├── AmpKnob.tsx             ← NEW: SVG knob component
│   ├── FilterPills.tsx         ← NEW: extracted filter pill bar
│   ├── ToneCard.tsx            ← updated: more compact, horizontal list style
│   ├── TagBadge.tsx            ← unchanged
│   ├── EmptyState.tsx          ← unchanged
│   ├── LoadingState.tsx        ← unchanged
│   └── SearchBar.tsx           ← unchanged
├── pages/
│   ├── LibraryPage.tsx         ← REDESIGNED: new split layout
│   ├── FavoritesPage.tsx       ← updated: same new layout
│   ├── UploadPage.tsx          ← updated: ampStyle field added
│   └── ToneDetailPage.tsx      ← may be retired or merged into LibraryPage
├── hooks/
│   └── useSelectedTone.ts      ← NEW: tracks currently displayed tone
└── App.tsx                     ← updated: new layout wrapper
```

---

## Overall Layout (replace dashboard entirely)

### Desktop layout:
```
[Sidebar - hover to expand]  |  [Main Content Area]
                             |  [SearchBar + FilterPills]
                             |  ─────────────────────────
                             |  [AmpDisplay - selected tone]
                             |  ─────────────────────────
                             |  [Tone List - scrollable]
```

### Mobile layout (stacked):
```
[Hamburger menu → drawer]
[SearchBar]
[FilterPills - horizontal scroll]
[AmpDisplay]
[Tone List - vertical scroll]
```

---

## `src/components/Sidebar.tsx` — Full Redesign

### Desktop behavior:
- Default state: collapsed to `w-14` (icon only — show only icons, no labels)
- On hover: expands to `w-56` with smooth CSS transition (`transition-all duration-300`)
- Use CSS `group` on the sidebar element and `group-hover` on inner content
- Show logo icon always; show full "ToneLib" text only when expanded
- Nav icons always visible; labels fade in on expand using opacity transition
- Sync status dot always visible

### Mobile behavior:
- Hidden by default
- Hamburger icon (Menu from lucide-react) fixed top-left
- Clicking opens a full-height drawer overlay from the left
- Clicking outside or a nav link closes it
- Use Framer Motion `AnimatePresence` for drawer open/close animation

### Both:
- Background: `bg-brand-surface`
- Right border: `border-brand-border`
- Nav links: Library, Favorites, Add Tone
- Bottom: sync status indicator

---

## `src/hooks/useSelectedTone.ts`

Simple hook managing which tone is currently displayed in the amp.

State:
- `selectedTone: Tone | null`
- `previousTone: Tone | null` (used for exit animation)

Actions:
- `selectTone(tone: Tone)` — sets selectedTone, stores previous
- `clearTone()` — sets selectedTone to null

On LibraryPage mount: auto-select the first tone in the list if none selected.

---

## `src/components/AmpDisplay.tsx`

Wrapper component that handles the fade + scale animation between tones.

Props: `tone: Tone | null`

Animation behavior using Framer Motion:
- Use `AnimatePresence mode="wait"` so exit animation completes before enter begins
- Each tone renders with a unique key (tone.id) so Framer Motion treats it as a new element
- Enter animation: `opacity 0→1`, `scale 0.92→1`, duration 0.4s, ease "easeOut"
- Exit animation: `opacity 1→0`, `scale 1→0.95`, duration 0.25s, ease "easeIn"

Renders:
- `AmpHead` on top
- `AmpCabinet` below
- Tone title displayed on the amp faceplate (passed as prop to AmpHead)
- ampStyle passed to both to determine color theme

If `tone` is null: show a centered muted message "Select a tone from the library"

---

## Amp Color Themes

Define a theme map object used by AmpHead and AmpCabinet:

### `modern-black`
- Body: `#1a1a1a` tolex
- Panel: `#2a2a2a` brushed metal
- Accent: `#e8ff47` (brand accent)
- Knob color: `#333`
- Text: `#e8e8f0`
- Grille cloth: dark charcoal weave pattern

### `vintage-cream`
- Body: `#f5e6c8` cream tolex
- Panel: `#c8a96e` gold aluminum
- Accent: `#c8522a` (warm orange-red)
- Knob color: `#8b6914` (amber)
- Text: `#2a1a0a`
- Grille cloth: warm tan tweed pattern

### `british-gold`
- Body: `#1c1c1c` black tolex
- Panel: `#b8922a` gold panel
- Accent: `#e8c040`
- Knob color: `#222`
- Text: `#f0e0a0`
- Grille cloth: dark salt-and-pepper weave

### `custom-dark`
- Body: `#0d0d14` deep navy-black
- Panel: `#1a1a2e` dark purple-metal
- Accent: `#7b2fff` (purple)
- Knob color: `#1a1a2e`
- Text: `#c0a0ff`
- Grille cloth: deep purple-black weave

---

## `src/components/AmpHead.tsx`

SVG component. Props: `tone: Tone`, `theme: AmpTheme`

### Structure (SVG, roughly 600x280):
- Outer rectangle: rounded corners (r=8), tolex body color, subtle drop shadow
- Corner screws: 4 small circles at corners, metallic gray
- Top strip: thin rectangle across top, slightly lighter than body
- Center faceplate panel: brushed metal rectangle, panel color from theme
  - Faceplate border: 1px inset shadow effect
- Brand/title area: centered on faceplate, display font, tone.name in theme text color — this is where the amp "brand name" normally goes
- Knob row: 6 knobs evenly spaced across faceplate (see AmpKnob)
  - Labels below each knob: GAIN, BASS, MID, TREBLE, PRESENCE, VOLUME
  - Small monospace text, muted
- Power indicator LED: small circle, right side of faceplate, glowing accent color
  - Add CSS animation: subtle pulse glow using box-shadow keyframes
- Input jacks: 2 small rectangles bottom-right of faceplate
- Handle: centered arc shape at top of amp body (SVG path)

### Knob values mapping from tone metadata:
Since real knob values don't exist yet, derive them visually from tone tags:
- `high-gain` tag → GAIN knob at 85%
- `metal` or `djent` → TREBLE at 70%, BASS at 60%
- `clean` → GAIN at 20%, VOLUME at 60%
- `ambient` → PRESENCE at 30%, TREBLE at 40%
- `blues` → MID at 75%
- Default all others to 50%
This is cosmetic only — knobs are not interactive yet.

---

## `src/components/AmpCabinet.tsx`

SVG component. Props: `theme: AmpTheme`

### Structure (SVG, roughly 600x380):
- Outer rectangle: same tolex color as head, rounded corners, drop shadow
- Corner screws: 4 screws
- Inner grille frame: inset rectangle with slight border
- Grille cloth area: fills most of the cabinet face
  - Render as SVG pattern — small repeating dots or crosshatch to simulate grille cloth
  - Use theme grille color
  - Pattern ID must be unique per theme to avoid SVG conflicts
- Speaker cone: large circle centered in grille area
  - Outer ring: slightly darker than grille
  - Inner cone rings: 3-4 concentric circles getting smaller, subtle
  - Center dust cap: small filled circle
  - Mounting screws: 4 small circles at cardinal points of speaker
- Cabinet badge/logo: small rectangle bottom-center of grille, theme accent color

---

## `src/components/AmpKnob.tsx`

SVG component. Props: `label: string`, `value: number` (0–1), `theme: AmpTheme`

### Structure:
- Outer circle: knob body color from theme, subtle radial gradient for 3D effect
- Indicator line: thin line from center pointing toward value position
  - 0 = 7 o'clock position, 1 = 5 o'clock position (standard amp knob range)
  - Calculate angle: `startAngle + value * totalArcAngle`
- Inner circle: slightly smaller, darker, for depth
- No interactivity in Phase 5 — display only

---

## Updated: `src/pages/LibraryPage.tsx` — Full Redesign

### Layout:
```
<div class="flex h-screen overflow-hidden">
  <Sidebar />
  <main class="flex-1 flex flex-col overflow-hidden">
    <SearchBar />
    <FilterPills />
    <div class="flex-1 flex flex-col lg:flex-row overflow-hidden gap-0">
      <div class="lg:w-1/2 xl:w-3/5 flex items-center justify-center p-8">
        <AmpDisplay tone={selectedTone} />
      </div>
      <div class="lg:w-1/2 xl:w-2/5 overflow-y-auto border-l border-brand-border">
        {/* Tone list */}
      </div>
    </div>
  </main>
</div>
```

### Tone list (right panel):
- Compact horizontal list items, not cards
- Each item: tone name (bold), tags as small pills, created date
- Selected tone: highlighted with accent left border + subtle accent background
- Clicking a tone: calls `selectTone(tone)` — triggers amp animation
- Hover: subtle background highlight

### Mobile:
- AmpDisplay stacked above tone list
- AmpDisplay is shorter on mobile (scale down SVG viewBox)
- Tone list scrolls below

---

## `src/components/FilterPills.tsx`

Extract filter pill bar from LibraryPage into its own component.

- Horizontal scrollable row (no wrapping on mobile — scroll instead)
- "All" pill + one per tag from useTagList()
- Active pill: `bg-brand-accent text-black`
- Inactive: `border-brand-border text-brand-subtext`
- "Clear filters" X button appears at end of row when any filter active

---

## Responsive Breakpoints

Use Tailwind breakpoints consistently:
- `sm`: 640px — mobile adjustments
- `lg`: 1024px — sidebar behavior switches, amp/list split view appears
- `xl`: 1280px — wider amp display

On mobile (`< lg`):
- Sidebar hidden, hamburger shown
- Layout stacks vertically: amp on top, list below
- AmpDisplay SVG scales to fit width (use `viewBox` + `width="100%"`)
- Filter pills scroll horizontally

---

## Animation Summary

All animations use Framer Motion:

| Element | Animation |
|---|---|
| Amp swap | Fade + scale (AnimatePresence, mode="wait") |
| Sidebar drawer (mobile) | Slide in from left (x: -300 → 0) |
| Tone list items | Stagger fade in on initial load (0.05s delay per item) |
| Filter pill active state | Layout animation (Framer Motion `layout` prop) |
| LED power indicator | CSS keyframe pulse (no Framer Motion needed) |

---

## Design Rules
- No new colors beyond the 4 amp themes
- Amp SVG must look realistic — use gradients, shadows, and layering
- Tone title on faceplate: font-display uppercase, sized to fit, never overflow (use SVG `textLength` or truncate)
- All existing brand colors still used for UI chrome outside the amp
- Amp scales responsively using SVG viewBox — never fixed pixel dimensions
- Keep filter pills, search, and sidebar consistent with Phase 1-4 styling
