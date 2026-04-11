import { useMemo, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToneStore } from '../store/useToneStore';
import type { Tone } from '../types/tone';

function uniqueTagsFromTones(tones: Tone[]): string[] {
  const set = new Set<string>();
  for (const tone of tones) {
    for (const tag of tone.tags) {
      set.add(tag);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export default function UploadPage() {
  const navigate = useNavigate();
  const tones = useToneStore((s) => s.tones);
  const addTone = useToneStore((s) => s.addTone);

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [favorite, setFavorite] = useState(false);
  const [nameError, setNameError] = useState('');

  const [namFile, setNamFile] = useState('');
  const [irFile, setIrFile] = useState('');
  const [namFileURL, setNamFileURL] = useState<string | null>(null);
  const [irFileURL, setIrFileURL] = useState<string | null>(null);

  const availableTags = useMemo(() => uniqueTagsFromTones(tones), [tones]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleNamChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (namFileURL) URL.revokeObjectURL(namFileURL);
    if (!file) {
      setNamFile('');
      setNamFileURL(null);
      return;
    }
    setNamFile(file.name);
    setNamFileURL(URL.createObjectURL(file));
  };

  const handleIrChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (irFileURL) URL.revokeObjectURL(irFileURL);
    if (!file) {
      setIrFile('');
      setIrFileURL(null);
      return;
    }
    setIrFile(file.name);
    setIrFileURL(URL.createObjectURL(file));
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Name is required.');
      return;
    }
    setNameError('');

    const newTone: Tone = {
      id: uuidv4(),
      name: trimmed,
      tags: selectedTags,
      notes: notes.trim(),
      namFile,
      irFile,
      namFileURL,
      irFileURL,
      createdAt: new Date().toISOString().slice(0, 10),
      favorite,
    };

    addTone(newTone);
    navigate('/');
  };

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-brand-text mb-1">
          Add Tone
        </h1>
        <p className="text-brand-subtext text-sm">Save a new tone to your library.</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-body font-semibold uppercase tracking-wide text-brand-subtext">
            Tone Name *
          </label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            placeholder="e.g. Metal Rhythm Tight"
            className="bg-brand-card border border-brand-border rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-colors"
          />
          {nameError ? (
            <p className="text-sm text-red-400">{nameError}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-body font-semibold uppercase tracking-wide text-brand-subtext">
            Notes
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe the tone, amp settings, use cases..."
            className="bg-brand-card border border-brand-border rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-colors resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-body font-semibold uppercase tracking-wide text-brand-subtext">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`font-body text-sm font-medium px-4 py-2 rounded-full border capitalize transition-all duration-200 ${
                  selectedTags.includes(tag)
                    ? 'bg-brand-accent text-black border-brand-accent shadow-[0_0_20px_-4px_rgba(232,255,71,0.45)]'
                    : 'bg-brand-card/60 text-brand-subtext border-brand-border hover:border-brand-accent/35 hover:text-brand-text'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-body font-semibold uppercase tracking-wide text-brand-subtext">
            Favorite
          </label>
          <button
            type="button"
            onClick={() => setFavorite((f) => !f)}
            className={`font-body text-sm font-medium px-4 py-2 rounded-full border w-fit transition-all duration-200 ${
              favorite
                ? 'bg-brand-accent text-black border-brand-accent shadow-[0_0_20px_-4px_rgba(232,255,71,0.45)]'
                : 'bg-brand-card/60 text-brand-subtext border-brand-border hover:border-brand-accent/35 hover:text-brand-text'
            }`}
          >
            {favorite ? 'Favorited' : 'Not favorited'}
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="nam-file-input"
            className="text-xs font-body font-semibold uppercase tracking-wide text-brand-subtext"
          >
            NAM file
          </label>
          <input
            id="nam-file-input"
            type="file"
            accept=".nam"
            className="sr-only"
            onChange={handleNamChange}
          />
          <label
            htmlFor="nam-file-input"
            className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-brand-border rounded-2xl py-8 text-brand-muted text-sm gap-2 transition-colors hover:border-brand-accent/40"
          >
            <Upload size={16} />
            Choose .nam file
          </label>
          {namFile ? (
            <p className="text-xs text-brand-muted font-mono">{namFile}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="ir-file-input"
            className="text-xs font-body font-semibold uppercase tracking-wide text-brand-subtext"
          >
            IR file
          </label>
          <input
            id="ir-file-input"
            type="file"
            accept=".wav"
            className="sr-only"
            onChange={handleIrChange}
          />
          <label
            htmlFor="ir-file-input"
            className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-brand-border rounded-2xl py-8 text-brand-muted text-sm gap-2 transition-colors hover:border-brand-accent/40"
          >
            <Upload size={16} />
            Choose .wav file
          </label>
          {irFile ? (
            <p className="text-xs text-brand-muted font-mono">{irFile}</p>
          ) : null}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="bg-brand-accent text-black font-display font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-brand-accentDim shadow-[0_0_24px_-6px_rgba(232,255,71,0.5)] transition-colors"
          >
            Save Tone
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-brand-subtext text-sm px-4 py-2.5 rounded-full hover:text-brand-text transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
