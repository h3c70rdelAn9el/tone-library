import { useMemo, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileAudio, Mic2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToneStore } from '../store/useToneStore';
import {
  createTone,
  uploadNamFile,
  uploadIrFile,
} from '../services/toneService';
import { isSupabaseConfigured } from '../lib/supabase';
import type { AmpStyle, Tone } from '../types/tone';
import {
  buildUploadPreviewTone,
  uniqueTagsFromTones,
} from '../lib/toneForm';
import { useFilePickState } from '../hooks/useFilePickState';
import FileDropRow from '../components/FileDropRow';
import AmpStyleSelect from '../components/AmpStyleSelect';
import UploadTagField from '../components/UploadTagField';
import UploadAmpPreviewPanel from '../components/UploadAmpPreviewPanel';

/**
 * Form state stays on this page. A global store is only worth it if you need a
 * draft to survive route changes (e.g. leave Upload and return without losing fields).
 */

export default function UploadPage() {
  const navigate = useNavigate();
  const tones = useToneStore((s) => s.tones);
  const addTone = useToneStore((s) => s.addTone);
  const setSyncStatus = useToneStore((s) => s.setSyncStatus);

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [favorite, setFavorite] = useState(false);
  const [ampStyle, setAmpStyle] = useState<AmpStyle>('modern-black');
  const [nameError, setNameError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const nam = useFilePickState();
  const ir = useFilePickState();

  const availableTags = useMemo(() => uniqueTagsFromTones(tones), [tones]);

  const previewTone = useMemo(
    () =>
      buildUploadPreviewTone({
        name,
        tags: selectedTags,
        notes,
        namFile: nam.displayName,
        irFile: ir.displayName,
        favorite,
        ampStyle,
      }),
    [
      name,
      selectedTags,
      notes,
      nam.displayName,
      ir.displayName,
      favorite,
      ampStyle,
    ],
  );

  const addTagString = (raw: string) => {
    const t = raw.trim().replace(/^,+|,+$/g, '');
    if (!t) return;
    const lower = t.toLowerCase();
    if (selectedTags.some((x) => x.toLowerCase() === lower)) return;
    setSelectedTags((prev) => [...prev, t]);
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((x) => x !== tag));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTagString(tagInput);
      setTagInput('');
    }
  };

  const handleTagInputChange = (value: string) => {
    if (value.includes(',')) {
      const parts = value.split(',');
      parts.slice(0, -1).forEach((p) => addTagString(p));
      setTagInput(parts[parts.length - 1] ?? '');
    } else {
      setTagInput(value);
    }
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
        if (nam.file) {
          namPublic = await uploadNamFile(nam.file);
          if (!namPublic) {
            setSubmitError('NAM file upload failed.');
            return;
          }
        }
        if (ir.file) {
          irPublic = await uploadIrFile(ir.file);
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
        namFile: nam.displayName,
        irFile: ir.displayName,
        favorite,
        ampStyle,
      };

      if (!isSupabaseConfigured()) {
        const localTone: Tone = {
          id: uuidv4(),
          ...baseFields,
          namFileURL: nam.objectUrl,
          irFileURL: ir.objectUrl,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        addTone(localTone);
        setSyncStatus('local');
        if (nam.objectUrl) URL.revokeObjectURL(nam.objectUrl);
        if (ir.objectUrl) URL.revokeObjectURL(ir.objectUrl);
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
        if (nam.objectUrl) URL.revokeObjectURL(nam.objectUrl);
        if (ir.objectUrl) URL.revokeObjectURL(ir.objectUrl);
        navigate('/');
        return;
      }

      const fallback: Tone = {
        id: uuidv4(),
        ...baseFields,
        namFileURL: namPublic ?? nam.objectUrl,
        irFileURL: irPublic ?? ir.objectUrl,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      addTone(fallback);
      setSyncStatus('local');
      if (nam.objectUrl) URL.revokeObjectURL(nam.objectUrl);
      if (ir.objectUrl) URL.revokeObjectURL(ir.objectUrl);
      navigate('/');
    } catch (e) {
      console.error(e);
      setSubmitError('Something went wrong. Try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row lg:overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto border-brand-border p-8 lg:max-w-xl lg:shrink-0 lg:border-r">
        <div className="mb-8">
          <h1 className="mb-1 font-display text-4xl font-semibold tracking-tight text-brand-text">
            Add Tone
          </h1>
          <p className="text-sm text-brand-subtext">
            Save a new tone to your library.
          </p>
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
              className="rounded-xl border border-brand-border bg-brand-card px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted transition-colors focus:border-brand-accent/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 disabled:opacity-50"
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
              className="resize-none rounded-xl border border-brand-border bg-brand-card px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted transition-colors focus:border-brand-accent/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 disabled:opacity-50"
            />
          </div>

          <UploadTagField
            selectedTags={selectedTags}
            tagInput={tagInput}
            availableTags={availableTags}
            disabled={uploading}
            onTagInputChange={handleTagInputChange}
            onTagInputKeyDown={handleTagInputKeyDown}
            onRemoveTag={removeTag}
            onToggleSuggestedTag={toggleTag}
          />

          <AmpStyleSelect
            value={ampStyle}
            disabled={uploading}
            onChange={setAmpStyle}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-body font-semibold uppercase tracking-wide text-brand-subtext">
              Favorite
            </label>
            <button
              type="button"
              disabled={uploading}
              onClick={() => setFavorite((f) => !f)}
              className={`w-fit rounded-full border px-4 py-2 font-body text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                favorite
                  ? 'border-brand-accent bg-brand-accent text-black shadow-[0_0_20px_-4px_rgba(232,255,71,0.45)]'
                  : 'border-brand-border bg-brand-card/60 text-brand-subtext hover:border-brand-accent/35 hover:text-brand-text'
              }`}
            >
              {favorite ? 'Favorited' : 'Not favorited'}
            </button>
          </div>

          <FileDropRow
            inputId="nam-file-input"
            sectionLabel="NAM file"
            accept=".nam"
            Icon={FileAudio}
            emptyCta="Choose .nam file"
            displayName={nam.displayName}
            disabled={uploading}
            inputRef={nam.inputRef}
            onInputChange={nam.onInputChange}
            onClear={nam.clear}
            clearAriaLabel="Remove NAM file"
          />

          <FileDropRow
            inputId="ir-file-input"
            sectionLabel="IR file"
            accept=".wav"
            Icon={Mic2}
            emptyCta="Choose .wav file"
            displayName={ir.displayName}
            disabled={uploading}
            inputRef={ir.inputRef}
            onInputChange={ir.onInputChange}
            onClear={ir.clear}
            clearAriaLabel="Remove IR file"
          />

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => void handleSave()}
              className="rounded-full bg-brand-accent px-6 py-2.5 font-display text-sm font-semibold text-black shadow-[0_0_24px_-6px_rgba(232,255,71,0.5)] transition-colors hover:bg-brand-accentDim disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Save Tone'}
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => navigate('/')}
              className="rounded-full px-4 py-2.5 text-sm text-brand-subtext transition-colors hover:text-brand-text disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <UploadAmpPreviewPanel previewTone={previewTone} />
    </div>
  );
}
