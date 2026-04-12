# 🎸 ToneForge — Phase 1 Build Instructions

> Hand this file to Cursor. It will scaffold the full Phase 1 UI.

---

## 🧱 Stack

- React + Vite
- Tailwind CSS v3
- React Router DOM v6
- Lucide React (icons)
- clsx (conditional classNames utility)

---

## 📦 Step 1 — Install Dependencies

Run these in your project root (assuming Vite + React already initialized):

```bash
npm install tailwindcss @tailwindcss/vite
npm install react-router-dom
npm install lucide-react
npm install clsx
```

Then initialize Tailwind:

```bash
npx tailwindcss init -p
```

---

## ⚙️ Step 2 — Configure Tailwind

### `tailwind.config.js`

Replace the contents with:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0d0d0f',
          surface: '#16161a',
          card: '#1c1c22',
          border: '#2a2a35',
          accent: '#e8ff47', // electric yellow-green
          accentDim: '#b8cc2e',
          muted: '#555566',
          text: '#e8e8f0',
          subtext: '#888899',
        },
      },
      fontFamily: {
        display: ["'Barlow Condensed'", 'sans-serif'],
        body: ["'DM Sans'", 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
    },
  },
  plugins: [],
};
```

### `src/index.css`

Replace with:

```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

body {
  background-color: #0d0d0f;
  color: #e8e8f0;
  font-family: 'DM Sans', sans-serif;
  margin: 0;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #16161a;
}
::-webkit-scrollbar-thumb {
  background: #2a2a35;
  border-radius: 3px;
}
```

---

## 🗂️ Step 3 — File Structure to Create

```
src/
├── data/
│   └── mockTones.js          ← fake tone data
├── components/
│   ├── Sidebar.jsx            ← nav sidebar
│   ├── ToneCard.jsx           ← card shown in library grid
│   ├── TagBadge.jsx           ← reusable tag pill
│   └── EmptyState.jsx         ← shown when no tones
├── pages/
│   ├── LibraryPage.jsx        ← main tone grid view
│   ├── UploadPage.jsx         ← add new tone form
│   └── ToneDetailPage.jsx     ← single tone view
├── App.jsx                    ← router setup
└── main.jsx                   ← entry point (unchanged)
```

---

## 📄 Step 4 — File Contents

### `src/data/mockTones.js`

```js
export const mockTones = [
  {
    id: '1',
    name: 'Metal Rhythm Tight',
    tags: ['metal', 'rhythm', 'high-gain'],
    notes: 'Recto-style crunch. Tight low end, scooped mids. Works great for down-tuned riffs.',
    namFile: 'metal_rhythm_tight.nam',
    irFile: 'mesa_v30_close.wav',
    createdAt: '2025-03-10',
    favorite: true,
  },
  {
    id: '2',
    name: 'Clean Glassy Strat',
    tags: ['clean', 'strat', 'ambient'],
    notes: 'Fender-style clean. Very glassy and responsive. Blooms with reverb.',
    namFile: 'clean_glassy_strat.nam',
    irFile: 'tweed_sm57.wav',
    createdAt: '2025-03-14',
    favorite: false,
  },
  {
    id: '3',
    name: 'Blues Crunch OD',
    tags: ['blues', 'crunch', 'overdrive'],
    notes: "Mid-forward crunch. Plays well with the guitar's volume knob. Think SRV.",
    namFile: 'blues_crunch_od.nam',
    irFile: 'greenback_ribbon.wav',
    createdAt: '2025-03-18',
    favorite: true,
  },
  {
    id: '4',
    name: 'Ambient Post Lead',
    tags: ['ambient', 'lead', 'clean'],
    notes: 'Washy, reverb-heavy lead tone. Shimmer-friendly. Good for soundscapes.',
    namFile: 'ambient_post_lead.nam',
    irFile: 'church_ir_stereo.wav',
    createdAt: '2025-03-22',
    favorite: false,
  },
  {
    id: '5',
    name: 'Djent Modern High Gain',
    tags: ['metal', 'djent', 'high-gain', 'rhythm'],
    notes: 'Extremely tight modern high gain. Boosted with Horizon Drive impulse. Drop A capable.',
    namFile: 'djent_modern_hg.nam',
    irFile: 'ownhammer_6505.wav',
    createdAt: '2025-04-01',
    favorite: false,
  },
  {
    id: '6',
    name: 'Country Twang Clean',
    tags: ['clean', 'country', 'twang'],
    notes: 'Bright and spanky. Nashville tone. Telecaster pairs perfectly.',
    namFile: 'country_twang_clean.nam',
    irFile: 'tweed_deluxe_1x12.wav',
    createdAt: '2025-04-05',
    favorite: true,
  },
];
```

---

### `src/components/TagBadge.jsx`

```jsx
export default function TagBadge({ tag }) {
  return (
    <span className="text-xs font-mono px-2 py-0.5 rounded-sm bg-brand-border text-brand-subtext uppercase tracking-widest">
      {tag}
    </span>
  );
}
```

---

### `src/components/ToneCard.jsx`

```jsx
import { useNavigate } from 'react-router-dom';
import { Star, FileAudio, Mic2 } from 'lucide-react';
import TagBadge from './TagBadge';
import clsx from 'clsx';

export default function ToneCard({ tone }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/tone/${tone.id}`)}
      className={clsx(
        'group cursor-pointer rounded-lg border border-brand-border bg-brand-card p-5',
        'hover:border-brand-accent/50 hover:bg-brand-surface transition-all duration-200',
      )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-display text-xl font-semibold text-brand-text uppercase tracking-wide leading-tight group-hover:text-brand-accent transition-colors">
          {tone.name}
        </h3>
        {tone.favorite && (
          <Star
            size={14}
            className="text-brand-accent fill-brand-accent shrink-0 mt-1 ml-2"
          />
        )}
      </div>

      {/* Notes */}
      <p className="text-brand-subtext text-sm leading-relaxed mb-4 line-clamp-2">{tone.notes}</p>

      {/* Files */}
      <div className="flex flex-col gap-1 mb-4">
        {tone.namFile && (
          <div className="flex items-center gap-2 text-xs text-brand-muted font-mono">
            <FileAudio size={11} />
            {tone.namFile}
          </div>
        )}
        {tone.irFile && (
          <div className="flex items-center gap-2 text-xs text-brand-muted font-mono">
            <Mic2 size={11} />
            {tone.irFile}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {tone.tags.map((tag) => (
          <TagBadge
            key={tag}
            tag={tag}
          />
        ))}
      </div>
    </div>
  );
}
```

---

### `src/components/EmptyState.jsx`

```jsx
import { Guitar } from 'lucide-react';

export default function EmptyState({ message = 'No tones found.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-brand-muted gap-4">
      <Guitar
        size={40}
        strokeWidth={1}
      />
      <p className="font-display text-lg uppercase tracking-widest">{message}</p>
    </div>
  );
}
```

---

### `src/components/Sidebar.jsx`

```jsx
import { NavLink } from 'react-router-dom';
import { Library, Upload, Guitar } from 'lucide-react';
import clsx from 'clsx';

const links = [
  { to: '/', label: 'Library', icon: Library },
  { to: '/upload', label: 'Add Tone', icon: Upload },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 flex flex-col border-r border-brand-border bg-brand-surface px-4 py-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10 px-2">
        <Guitar
          size={20}
          className="text-brand-accent"
        />
        <span className="font-display text-xl font-bold uppercase tracking-widest text-brand-text">
          ToneLib
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all',
                isActive
                  ? 'bg-brand-accent/10 text-brand-accent font-medium'
                  : 'text-brand-subtext hover:text-brand-text hover:bg-brand-border/40',
              )
            }>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-2 text-xs text-brand-muted font-mono">Phase 1 — Local</div>
    </aside>
  );
}
```

---

### `src/pages/LibraryPage.jsx`

```jsx
import { useState } from 'react';
import { mockTones } from '../data/mockTones';
import ToneCard from '../components/ToneCard';
import EmptyState from '../components/EmptyState';
import { Search } from 'lucide-react';

const ALL_TAGS = [
  'metal',
  'clean',
  'ambient',
  'blues',
  'djent',
  'country',
  'rhythm',
  'lead',
  'crunch',
  'high-gain',
];

export default function LibraryPage() {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState(null);

  const filtered = mockTones.filter((tone) => {
    const matchesQuery =
      tone.name.toLowerCase().includes(query.toLowerCase()) ||
      tone.notes.toLowerCase().includes(query.toLowerCase());
    const matchesTag = activeTag ? tone.tags.includes(activeTag) : true;
    return matchesQuery && matchesTag;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold uppercase tracking-widest text-brand-text mb-1">
          ToneForge
        </h1>
        <p className="text-brand-subtext text-sm">{mockTones.length} tones saved</p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted"
        />
        <input
          type="text"
          placeholder="Search tones..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md bg-brand-card border border-brand-border rounded-md pl-9 pr-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent/50 transition-colors"
        />
      </div>

      {/* Tag Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveTag(null)}
          className={`text-xs font-mono px-3 py-1 rounded-sm uppercase tracking-widest border transition-all ${
            activeTag === null
              ? 'bg-brand-accent text-black border-brand-accent'
              : 'bg-transparent text-brand-subtext border-brand-border hover:border-brand-accent/40'
          }`}>
          All
        </button>
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`text-xs font-mono px-3 py-1 rounded-sm uppercase tracking-widest border transition-all ${
              activeTag === tag
                ? 'bg-brand-accent text-black border-brand-accent'
                : 'bg-transparent text-brand-subtext border-brand-border hover:border-brand-accent/40'
            }`}>
            {tag}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState message="No tones match your search." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((tone) => (
            <ToneCard
              key={tone.id}
              tone={tone}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### `src/pages/UploadPage.jsx`

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';

const AVAILABLE_TAGS = [
  'metal',
  'clean',
  'ambient',
  'blues',
  'djent',
  'country',
  'rhythm',
  'lead',
  'crunch',
  'high-gain',
];

export default function UploadPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Phase 2: wire to real data store
    alert(`Tone "${name}" would be saved here in Phase 2.`);
    navigate('/');
  };

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold uppercase tracking-widest text-brand-text mb-1">
          Add Tone
        </h1>
        <p className="text-brand-subtext text-sm">Save a new tone to your library.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono uppercase tracking-widest text-brand-subtext">
            Tone Name *
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Metal Rhythm Tight"
            className="bg-brand-card border border-brand-border rounded-md px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent/50 transition-colors"
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono uppercase tracking-widest text-brand-subtext">
            Notes
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe the tone, amp settings, use cases..."
            className="bg-brand-card border border-brand-border rounded-md px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent/50 transition-colors resize-none"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono uppercase tracking-widest text-brand-subtext">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-xs font-mono px-3 py-1 rounded-sm uppercase tracking-widest border transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-brand-accent text-black border-brand-accent'
                    : 'bg-transparent text-brand-subtext border-brand-border hover:border-brand-accent/40'
                }`}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* File Upload Placeholder */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono uppercase tracking-widest text-brand-subtext">
            NAM File (Phase 2)
          </label>
          <div className="flex items-center justify-center border border-dashed border-brand-border rounded-md py-8 text-brand-muted text-sm gap-2">
            <Upload size={16} />
            File upload coming in Phase 2
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-brand-accent text-black font-display font-bold uppercase tracking-widest text-sm px-6 py-2.5 rounded-md hover:bg-brand-accentDim transition-colors">
            Save Tone
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-brand-subtext text-sm px-4 py-2.5 rounded-md hover:text-brand-text transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

### `src/pages/ToneDetailPage.jsx`

```jsx
import { useParams, useNavigate } from 'react-router-dom';
import { mockTones } from '../data/mockTones';
import TagBadge from '../components/TagBadge';
import { ArrowLeft, Star, FileAudio, Mic2, Download, Trash2, Pencil } from 'lucide-react';

export default function ToneDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tone = mockTones.find((t) => t.id === id);

  if (!tone) {
    return (
      <div className="p-8 text-brand-subtext font-mono text-sm">
        Tone not found.{' '}
        <button
          onClick={() => navigate('/')}
          className="text-brand-accent underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-brand-subtext hover:text-brand-text text-sm mb-8 transition-colors">
        <ArrowLeft size={14} />
        Back to Library
      </button>

      {/* Title */}
      <div className="flex items-start justify-between mb-2">
        <h1 className="font-display text-5xl font-bold uppercase tracking-widest text-brand-text leading-none">
          {tone.name}
        </h1>
        {tone.favorite && (
          <Star
            size={18}
            className="text-brand-accent fill-brand-accent mt-1 ml-4 shrink-0"
          />
        )}
      </div>

      {/* Date */}
      <p className="text-brand-muted font-mono text-xs mb-6">Added {tone.createdAt}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tone.tags.map((tag) => (
          <TagBadge
            key={tag}
            tag={tag}
          />
        ))}
      </div>

      {/* Notes */}
      <div className="bg-brand-card border border-brand-border rounded-lg p-5 mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-brand-muted mb-3">Notes</p>
        <p className="text-brand-text text-sm leading-relaxed">{tone.notes}</p>
      </div>

      {/* Files */}
      <div className="bg-brand-card border border-brand-border rounded-lg p-5 mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-brand-muted mb-4">Files</p>
        <div className="flex flex-col gap-3">
          {tone.namFile && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-brand-subtext">
                <FileAudio
                  size={14}
                  className="text-brand-accent"
                />
                <span className="font-mono">{tone.namFile}</span>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-accent transition-colors">
                <Download size={12} />
                Download
              </button>
            </div>
          )}
          {tone.irFile && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-brand-subtext">
                <Mic2
                  size={14}
                  className="text-brand-accent"
                />
                <span className="font-mono">{tone.irFile}</span>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-accent transition-colors">
                <Download size={12} />
                Download
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex items-center gap-2 text-sm bg-brand-card border border-brand-border text-brand-subtext px-4 py-2 rounded-md hover:text-brand-text hover:border-brand-accent/40 transition-all">
          <Pencil size={13} />
          Edit
        </button>
        <button className="flex items-center gap-2 text-sm text-red-400/60 hover:text-red-400 px-4 py-2 rounded-md transition-colors">
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </div>
  );
}
```

---

### `src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LibraryPage from './pages/LibraryPage';
import UploadPage from './pages/UploadPage';
import ToneDetailPage from './pages/ToneDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-brand-bg">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route
              path="/"
              element={<LibraryPage />}
            />
            <Route
              path="/upload"
              element={<UploadPage />}
            />
            <Route
              path="/tone/:id"
              element={<ToneDetailPage />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
```

---

## ✅ What Phase 1 gives you

| Feature                   | Status |
| ------------------------- | ------ |
| Tone list with mock data  | ✅     |
| Search by name / notes    | ✅     |
| Filter by tag             | ✅     |
| Tone detail page          | ✅     |
| Add tone form (UI only)   | ✅     |
| Navigation + routing      | ✅     |
| Dark theme + brand colors | ✅     |
| Favorites indicator       | ✅     |

---

## 🔜 Phase 2 Preview

Next MD file will cover:

- Local state management with `useState` + `useContext` (so new tones actually persist in session)
- Replacing `mockTones` with a real data layer (Zustand or localStorage bridge)
- Wiring the Upload form to actually create a tone entry
- File input handling for `.nam` and `.wav` files (local object URLs)
