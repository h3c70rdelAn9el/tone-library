import { useMemo, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToneStore } from '../store/useToneStore';
import {
  createTone,
  uploadNamFile,
  uploadIrFile,
} from '../services/toneService';
import { isSupabaseConfigured } from '../lib/supabase';
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
  const setSyncStatus = useToneStore((s) => s.setSyncStatus);

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [favorite, setFavorite] = useState(false);
  const [nameError, setNameError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [uploading, setUploading] = useState(false);

  const [namFile, setNamFile] = useState('');
  const [irFile, setIrFile] = useState('');
  const [namFileURL, setNamFileURL] = useState<string | null>(null);
  const [irFileURL, setIrFileURL] = useState<string | null>(null);
  const [namFileObj, setNamFileObj] = useState<File | null>(null);
  const [irFileObj, setIrFileObj] = useState<File | null>(null);

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
      setNamFileObj(null);
      return;
    }
    setNamFileObj(file);
    setNamFile(file.name);
    setNamFileURL(URL.createObjectURL(file));
  };

  const handleIrChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (irFileURL) URL.revokeObjectURL(irFileURL);
    if (!file) {
      setIrFile('');
      setIrFileURL(null);
      setIrFileObj(null);
      return;
    }
    setIrFileObj(file);
    setIrFile(file.name);
    setIrFileURL(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Name is required.');
      return;
    }
    setNameError('');
    setSubmitError('');
    setUploading(true);

    try {
      let namPublic: string | null = null;
      let irPublic: string | null = null;

      if (isSupabaseConfigured()) {
        if (namFileObj) {
          namPublic = await uploadNamFile(namFileObj);
          if (!namPublic) {
            setSubmitError('NAM file upload failed.');
            return;
          }
        }
        if (irFileObj) {
          irPublic = await uploadIrFile(irFileObj);
          if (!irPublic) {
            setSubmitError('IR file upload failed.');
            return;
          }
        }
      }

      const baseFields = {
        name: trimmed,
        tags: selectedTags,
        notes: notes.trim(),
        namFile,
        irFile,
        favorite,
      };

      if (!isSupabaseConfigured()) {
        const localTone: Tone = {
          id: uuidv4(),
          ...baseFields,
          namFileURL: namFileURL,
          irFileURL: irFileURL,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        addTone(localTone);
        setSyncStatus('local');
        if (namFileURL) URL.revokeObjectURL(namFileURL);
        if (irFileURL) URL.revokeObjectURL(irFileURL);
        navigate('/');
        return;
      }

      const created = await createTone({
        ...baseFields,
        namFileURL: namPublic,
        irFileURL: irPublic,
      });
      if (created) {
        addTone(created);
        setSyncStatus('synced');
        if (namFileURL) URL.revokeObjectURL(namFileURL);
        if (irFileURL) URL.revokeObjectURL(irFileURL);
        navigate('/');
        return;
      }

      const fallback: Tone = {
        id: uuidv4(),
        ...baseFields,
        namFileURL: namPublic ?? namFileURL,
        irFileURL: irPublic ?? irFileURL,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      addTone(fallback);
      setSyncStatus('local');
      if (namFileURL) URL.revokeObjectURL(namFileURL);
      if (irFileURL) URL.revokeObjectURL(irFileURL);
      navigate('/');
    } catch (e) {
      console.error(e);
      setSubmitError('Something went wrong. Try again.');
    } finally {
      setUploading(false);
    }
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
        {submitError ? (
          <p className="text-sm text-red-400">{submitError}</p>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-body font-semibold uppercase tracking-wide text-brand-subtext">
            Tone Name *
          </label>
          <input
            disabled={uploading}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            placeholder="e.g. Metal Rhythm Tight"
            className="bg-brand-card border border-brand-border rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-colors disabled:opacity-50"
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
            disabled={uploading}
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe the tone, amp settings, use cases..."
            className="bg-brand-card border border-brand-border rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-colors resize-none disabled:opacity-50"
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
                disabled={uploading}
                onClick={() => toggleTag(tag)}
                className={`font-body text-sm font-medium px-4 py-2 rounded-full border capitalize transition-all duration-200 disabled:opacity-50 ${
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
            disabled={uploading}
            onClick={() => setFavorite((f) => !f)}
            className={`font-body text-sm font-medium px-4 py-2 rounded-full border w-fit transition-all duration-200 disabled:opacity-50 ${
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
            disabled={uploading}
            onChange={handleNamChange}
          />
          <label
            htmlFor="nam-file-input"
            className={`flex cursor-pointer flex-col items-center justify-center border border-dashed border-brand-border rounded-2xl py-8 text-brand-muted text-sm gap-2 transition-colors hover:border-brand-accent/40 ${uploading ? 'pointer-events-none opacity-50' : ''}`}
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
            disabled={uploading}
            onChange={handleIrChange}
          />
          <label
            htmlFor="ir-file-input"
            className={`flex cursor-pointer flex-col items-center justify-center border border-dashed border-brand-border rounded-2xl py-8 text-brand-muted text-sm gap-2 transition-colors hover:border-brand-accent/40 ${uploading ? 'pointer-events-none opacity-50' : ''}`}
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
            disabled={uploading}
            onClick={() => void handleSave()}
            className="bg-brand-accent text-black font-display font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-brand-accentDim shadow-[0_0_24px_-6px_rgba(232,255,71,0.5)] transition-colors disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Save Tone'}
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={() => navigate('/')}
            className="text-brand-subtext text-sm px-4 py-2.5 rounded-full hover:text-brand-text transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
