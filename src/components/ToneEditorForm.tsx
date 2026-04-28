import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileAudio, Mic2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToneStore } from '../store/useToneStore';
import {
  createTone,
  updateTone as updateToneRemote,
  uploadNamFile,
  uploadIrFile,
} from '../services/toneService';
import { isSupabaseConfigured } from '../lib/supabase';
import type {
  AmpStyle,
  PickupPosition,
  PickupType,
  PlayStyle,
  ToneCard,
} from '../types/tone';
import {
  buildUploadPreviewTone,
  uniqueGenreTagsFromTones,
} from '../lib/toneForm';
import { useFilePickState } from '../hooks/useFilePickState';
import FileDropRow from './FileDropRow';
import AmpStyleSelect from './AmpStyleSelect';
import UploadTagField from './UploadTagField';
import UploadAmpPreviewPanel from './UploadAmpPreviewPanel';
import { useAuth } from '../context/AuthContext';
import { useSelectedTone } from '../hooks/useSelectedTone';

function optionalNum(raw: string): number | null {
  const t = raw.trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function numToInput(n: number | null): string {
  return n == null ? '' : String(n);
}

export type ToneEditorFormProps =
  | { variant: 'create' }
  | { variant: 'edit'; tone: ToneCard };

const inputClass =
  'rounded-xl border border-brand-border bg-brand-card px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted transition-colors focus:border-brand-accent/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 disabled:opacity-50';

const labelClass =
  'text-xs font-body font-semibold uppercase tracking-wide text-brand-subtext';

export default function ToneEditorForm(props: ToneEditorFormProps) {
  const navigate = useNavigate();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const tones = useToneStore((s) => s.tones);
  const addTone = useToneStore((s) => s.addTone);
  const updateToneLocal = useToneStore((s) => s.updateTone);
  const setSyncStatus = useToneStore((s) => s.setSyncStatus);
  const { selectTone } = useSelectedTone();

  const isEdit = props.variant === 'edit';
  const editTone = isEdit ? props.tone : null;
  const editSourceId = isEdit ? props.tone.id : null;

  const guestMode = !authLoading && !user;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mixNotes, setMixNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ampStyle, setAmpStyle] = useState<AmpStyle>('modern-black');
  const [ampModel, setAmpModel] = useState('');
  const [gainIn, setGainIn] = useState('');
  const [bassIn, setBassIn] = useState('');
  const [midIn, setMidIn] = useState('');
  const [trebleIn, setTrebleIn] = useState('');
  const [presenceIn, setPresenceIn] = useState('');
  const [tuning, setTuning] = useState('');
  const [pickupType, setPickupType] = useState<PickupType | ''>('');
  const [activePickups, setActivePickups] = useState(false);
  const [pickupPosition, setPickupPosition] = useState<PickupPosition | ''>('');
  const [playStyle, setPlayStyle] = useState<PlayStyle | ''>('');
  const [tightnessIn, setTightnessIn] = useState('');
  const [clarityIn, setClarityIn] = useState('');
  const [noiseLevelIn, setNoiseLevelIn] = useState('');

  const [nameError, setNameError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [forgeGlow, setForgeGlow] = useState(false);
  const pendingNavRef = useRef<string | null>(null);

  const nam = useFilePickState();
  const ir = useFilePickState();

  const formDisabled = uploading || guestMode;

  const availableTags = useMemo(() => uniqueGenreTagsFromTones(tones), [tones]);

  /* eslint-disable react-hooks/exhaustive-deps -- hydrate form only when `editSourceId` changes; avoid wiping in-progress edits on store re-renders. */
  useEffect(() => {
    if (props.variant !== 'edit') return;
    const t = props.tone;
    setName(t.name);
    setDescription(t.description ?? '');
    setMixNotes(t.mixNotes ?? '');
    setSelectedTags([...t.genreTags]);
    setAmpStyle(t.ampStyle ?? 'modern-black');
    setAmpModel(t.ampModel ?? '');
    setGainIn(numToInput(t.gain));
    setBassIn(numToInput(t.bass));
    setMidIn(numToInput(t.mid));
    setTrebleIn(numToInput(t.treble));
    setPresenceIn(numToInput(t.presence));
    setTuning(t.tuning ?? '');
    setPickupType(t.pickupType ?? '');
    setActivePickups(t.activePickups === true);
    setPickupPosition(t.pickupPosition ?? '');
    setPlayStyle(t.playStyle ?? '');
    setTightnessIn(numToInput(t.tightness));
    setClarityIn(numToInput(t.clarity));
    setNoiseLevelIn(numToInput(t.noiseLevel));
    setNameError('');
    setSubmitError('');
    setTagInput('');
    nam.hydrateDisplayOnly(t.namFile || '');
    ir.hydrateDisplayOnly(t.irFile || '');
  }, [editSourceId, nam.hydrateDisplayOnly, ir.hydrateDisplayOnly]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const previewTone = useMemo(
    () =>
      buildUploadPreviewTone({
        name,
        genreTags: selectedTags,
        description,
        mixNotes,
        namFile: nam.displayName,
        irFile: ir.displayName,
        ampStyle,
      }),
    [name, selectedTags, description, mixNotes, nam.displayName, ir.displayName, ampStyle],
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

  const cancelPath = isEdit && editTone ? `/tone/${editTone.id}` : '/';

  const navigateAfterForge = (path: string) => {
    pendingNavRef.current = path;
    setForgeGlow(true);
  };

  const onForgeGlowEnd = () => {
    const path = pendingNavRef.current;
    pendingNavRef.current = null;
    setForgeGlow(false);
    if (path) navigate(path);
  };

  const resolveNamIrForSave = (): {
    namFileUrl: string | null;
    irFileUrl: string | null;
    namFile: string;
    irFile: string;
  } => {
    if (isEdit && editTone) {
      let nextNamUrl: string | null = editTone.namFileUrl;
      let nextNamFile = editTone.namFile;
      if (nam.file) {
        nextNamFile = nam.displayName;
      } else if (!nam.displayName) {
        nextNamUrl = null;
        nextNamFile = '';
      } else {
        nextNamFile = nam.displayName;
      }

      let nextIrUrl: string | null = editTone.irFileUrl;
      let nextIrFile = editTone.irFile;
      if (ir.file) {
        nextIrFile = ir.displayName;
      } else if (!ir.displayName) {
        nextIrUrl = null;
        nextIrFile = '';
      } else {
        nextIrFile = ir.displayName;
      }

      return {
        namFile: nextNamFile,
        irFile: nextIrFile,
        namFileUrl: nextNamUrl,
        irFileUrl: nextIrUrl,
      };
    }

    return {
      namFile: nam.displayName,
      irFile: ir.displayName,
      namFileUrl: null,
      irFileUrl: null,
    };
  };

  const buildBaseCard = (
    trimmed: string,
    resolved: ReturnType<typeof resolveNamIrForSave>,
  ): Omit<ToneCard, 'id' | 'createdAt' | 'updatedAt'> => ({
    name: trimmed,
    description: description.trim() || undefined,
    mixNotes: mixNotes.trim() || undefined,
    ampModel: ampModel.trim() || undefined,
    genreTags: selectedTags,
    namFile: nam.file ? nam.displayName : resolved.namFile,
    irFile: ir.file ? ir.displayName : resolved.irFile,
    namFileUrl: resolved.namFileUrl,
    irFileUrl: resolved.irFileUrl,
    gain: optionalNum(gainIn),
    bass: optionalNum(bassIn),
    mid: optionalNum(midIn),
    treble: optionalNum(trebleIn),
    presence: optionalNum(presenceIn),
    tuning: tuning.trim() || undefined,
    pickupType: pickupType || undefined,
    activePickups: pickupType ? activePickups : undefined,
    pickupPosition: pickupPosition || undefined,
    playStyle: playStyle || undefined,
    tightness: optionalNum(tightnessIn),
    clarity: optionalNum(clarityIn),
    noiseLevel: optionalNum(noiseLevelIn),
    ampStyle,
  });

  const handleSave = async () => {
    if (guestMode || !user) return;
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
          namPublic = await uploadNamFile(nam.file, user.id);
          if (!namPublic) {
            setSubmitError('NAM file upload failed.');
            return;
          }
        }
        if (ir.file) {
          irPublic = await uploadIrFile(ir.file, user.id);
          if (!irPublic) {
            setSubmitError('IR file upload failed.');
            return;
          }
        }
      }

      const resolved = resolveNamIrForSave();
      const baseCard = buildBaseCard(trimmed, resolved);

      if (isEdit && editTone) {
        const nextNamURL = nam.file
          ? (namPublic ?? nam.objectUrl)
          : resolved.namFileUrl;
        const nextIrURL = ir.file
          ? (irPublic ?? ir.objectUrl)
          : resolved.irFileUrl;

        if (!isSupabaseConfigured()) {
          const updated: ToneCard = {
            ...editTone,
            ...baseCard,
            namFileUrl: nam.file ? nam.objectUrl : nextNamURL,
            irFileUrl: ir.file ? ir.objectUrl : nextIrURL,
          };
          updateToneLocal(updated);
          selectTone(updated);
          setSyncStatus('local');
          if (nam.objectUrl) URL.revokeObjectURL(nam.objectUrl);
          if (ir.objectUrl) URL.revokeObjectURL(ir.objectUrl);
          navigateAfterForge(`/tone/${editTone.id}`);
          return;
        }

        const remote = await updateToneRemote(editTone.id, {
          name: baseCard.name,
          genre_tags: baseCard.genreTags,
          description: baseCard.description ?? null,
          mix_notes: baseCard.mixNotes ?? null,
          nam_file: baseCard.namFile || null,
          ir_file: baseCard.irFile || null,
          nam_file_url: nextNamURL,
          ir_file_url: nextIrURL,
          amp_model: baseCard.ampModel ?? null,
          gain: baseCard.gain,
          bass: baseCard.bass,
          mid: baseCard.mid,
          treble: baseCard.treble,
          presence: baseCard.presence,
          tuning: baseCard.tuning ?? null,
          guitar_type: baseCard.pickupType ?? null,
          active_pickups: baseCard.activePickups === true,
          pickup_position: baseCard.pickupPosition ?? null,
          play_style: baseCard.playStyle ?? null,
          tightness: baseCard.tightness,
          clarity: baseCard.clarity,
          noise_level: baseCard.noiseLevel,
          amp_style: baseCard.ampStyle ?? 'modern-black',
        });

        if (remote) {
          updateToneLocal(remote);
          selectTone(remote);
          setSyncStatus('synced');
          if (nam.objectUrl) URL.revokeObjectURL(nam.objectUrl);
          if (ir.objectUrl) URL.revokeObjectURL(ir.objectUrl);
          navigateAfterForge(`/tone/${editTone.id}`);
          return;
        }

        const fallback: ToneCard = {
          ...editTone,
          ...baseCard,
          namFileUrl: nextNamURL ?? nam.objectUrl ?? editTone.namFileUrl,
          irFileUrl: nextIrURL ?? ir.objectUrl ?? editTone.irFileUrl,
        };
        updateToneLocal(fallback);
        selectTone(fallback);
        setSyncStatus('local');
        if (nam.objectUrl) URL.revokeObjectURL(nam.objectUrl);
        if (ir.objectUrl) URL.revokeObjectURL(ir.objectUrl);
        navigateAfterForge(`/tone/${editTone.id}`);
        return;
      }

      /* create */
      if (!isSupabaseConfigured()) {
        const now = new Date().toISOString();
        const localTone: ToneCard = {
          id: uuidv4(),
          ...baseCard,
          namFileUrl: nam.objectUrl,
          irFileUrl: ir.objectUrl,
          createdAt: now.slice(0, 10),
          updatedAt: now,
        };
        addTone(localTone);
        setSyncStatus('local');
        if (nam.objectUrl) URL.revokeObjectURL(nam.objectUrl);
        if (ir.objectUrl) URL.revokeObjectURL(ir.objectUrl);
        navigateAfterForge('/');
        return;
      }

      const created = await createTone(
        {
          ...baseCard,
          namFileUrl: namPublic,
          irFileUrl: irPublic,
        },
        user.id,
      );
      if (created) {
        addTone(created);
        setSyncStatus('synced');
        if (nam.objectUrl) URL.revokeObjectURL(nam.objectUrl);
        if (ir.objectUrl) URL.revokeObjectURL(ir.objectUrl);
        navigateAfterForge('/');
        return;
      }

      const now = new Date().toISOString();
      const fallback: ToneCard = {
        id: uuidv4(),
        ...baseCard,
        namFileUrl: namPublic ?? nam.objectUrl,
        irFileUrl: irPublic ?? ir.objectUrl,
        createdAt: now.slice(0, 10),
        updatedAt: now,
      };
      addTone(fallback);
      setSyncStatus('local');
      if (nam.objectUrl) URL.revokeObjectURL(nam.objectUrl);
      if (ir.objectUrl) URL.revokeObjectURL(ir.objectUrl);
      navigateAfterForge('/');
    } catch (e) {
      console.error(e);
      setSubmitError('Something went wrong. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const title = isEdit ? 'Edit Tone' : 'Add Tone';
  const subtitle = isEdit
    ? 'Update this tone and save changes.'
    : 'Save a new tone to your library.';
  const saveLabel = guestMode
    ? 'Sign in to save'
    : uploading
      ? isEdit
        ? 'Saving...'
        : 'Uploading...'
      : isEdit
        ? 'Save changes'
        : 'Save Tone';

  const numField = (
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    hint?: string,
  ) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        step="any"
        disabled={formDisabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={hint ?? 'Leave empty if unknown'}
        className={inputClass}
      />
    </div>
  );

  return (
    <>
      {forgeGlow ? (
        <div
          className="forge-glow-overlay fixed inset-0 z-[200]"
          onAnimationEnd={onForgeGlowEnd}
        />
      ) : null}
      <div className="flex h-full min-h-0 flex-col lg:flex-row lg:overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto border-brand-border p-8 lg:max-w-xl lg:shrink-0 lg:border-r">
          <div className="mb-8">
            <h1 className="mb-1 font-display-heading text-4xl font-semibold text-brand-text">
              {title}
            </h1>
            <p className="text-sm text-brand-subtext">{subtitle}</p>
          </div>

          <div className="flex flex-col gap-6">
            {guestMode ? (
              <div className="rounded-md border border-brand-accent/30 bg-brand-accent/10 p-4">
                <p className="mb-3 font-body text-sm text-brand-text">
                  Sign in with Google to save your tones
                </p>
                <button
                  type="button"
                  onClick={() => void signInWithGoogle()}
                  className="btn-primary-sm"
                >
                  Sign in with Google
                </button>
              </div>
            ) : null}

            {submitError ? (
              <p className="text-sm text-red-400">{submitError}</p>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Tone Name *</label>
              <input
                disabled={formDisabled}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError('');
                }}
                placeholder="e.g. Metal Rhythm Tight"
                className={inputClass}
              />
              {nameError ? (
                <p className="text-sm text-red-400">{nameError}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Description</label>
              <textarea
                disabled={formDisabled}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why this tone exists — intent, vibe, use case"
                className={`resize-none ${inputClass}`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Mix notes</label>
              <textarea
                disabled={formDisabled}
                rows={3}
                value={mixNotes}
                onChange={(e) => setMixNotes(e.target.value)}
                placeholder="How it behaves in a mix — EQ, dynamics, translation"
                className={`resize-none ${inputClass}`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Amp model</label>
              <input
                disabled={formDisabled}
                value={ampModel}
                onChange={(e) => setAmpModel(e.target.value)}
                placeholder="e.g. reference amp or plugin model"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {numField('gain', 'Gain (0–10)', gainIn, setGainIn)}
              {numField('bass', 'Bass (0–10)', bassIn, setBassIn)}
              {numField('mid', 'Mid (0–10)', midIn, setMidIn)}
              {numField('treble', 'Treble (0–10)', trebleIn, setTrebleIn)}
              {numField('presence', 'Presence (0–10)', presenceIn, setPresenceIn)}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Tuning</label>
                <input
                  disabled={formDisabled}
                  value={tuning}
                  onChange={(e) => setTuning(e.target.value)}
                  placeholder="e.g. Drop C"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Play style</label>
                <select
                  disabled={formDisabled}
                  value={playStyle}
                  onChange={(e) =>
                    setPlayStyle((e.target.value || '') as PlayStyle | '')
                  }
                  className={inputClass}
                >
                  <option value="">—</option>
                  <option value="rhythm">Rhythm</option>
                  <option value="lead">Lead</option>
                  <option value="ambient">Ambient</option>
                  <option value="clean">Clean</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Pickup type</label>
                <select
                  disabled={formDisabled}
                  value={pickupType}
                  onChange={(e) => {
                    const v = (e.target.value || '') as PickupType | '';
                    setPickupType(v);
                    if (!v) setActivePickups(false);
                  }}
                  className={inputClass}
                >
                  <option value="">—</option>
                  <option value="single_coil">Single coil</option>
                  <option value="humbucker">Humbucker</option>
                </select>
                <label
                  className={`flex cursor-pointer items-center gap-2 text-sm ${
                    pickupType ? 'text-brand-subtext' : 'text-brand-muted'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={activePickups}
                    disabled={formDisabled || !pickupType}
                    onChange={(e) => setActivePickups(e.target.checked)}
                    className="h-4 w-4 rounded border-brand-border bg-brand-card text-brand-accent focus:ring-brand-accent/30"
                  />
                  Active pickups
                </label>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Pickup position</label>
                <select
                  disabled={formDisabled}
                  value={pickupPosition}
                  onChange={(e) =>
                    setPickupPosition(
                      (e.target.value || '') as PickupPosition | '',
                    )
                  }
                  className={inputClass}
                >
                  <option value="">—</option>
                  <option value="neck">Neck</option>
                  <option value="middle">Middle</option>
                  <option value="bridge">Bridge</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {numField(
                'tightness',
                'Tightness (0–10)',
                tightnessIn,
                setTightnessIn,
              )}
              {numField('clarity', 'Clarity (0–10)', clarityIn, setClarityIn)}
              {numField(
                'noise',
                'Noise level (0–10)',
                noiseLevelIn,
                setNoiseLevelIn,
              )}
            </div>

            <UploadTagField
              selectedTags={selectedTags}
              tagInput={tagInput}
              availableTags={availableTags}
              disabled={formDisabled}
              onTagInputChange={handleTagInputChange}
              onTagInputKeyDown={handleTagInputKeyDown}
              onRemoveTag={removeTag}
              onToggleSuggestedTag={toggleTag}
            />

            <AmpStyleSelect
              value={ampStyle}
              disabled={formDisabled}
              onChange={setAmpStyle}
            />

            <FileDropRow
              inputId={isEdit ? 'edit-nam-file-input' : 'nam-file-input'}
              sectionLabel="NAM file"
              accept=".nam"
              Icon={FileAudio}
              emptyCta="Choose .nam file"
              displayName={nam.displayName}
              disabled={formDisabled}
              inputRef={nam.inputRef}
              onInputChange={nam.onInputChange}
              onClear={nam.clear}
              clearAriaLabel="Remove NAM file"
            />

            <FileDropRow
              inputId={isEdit ? 'edit-ir-file-input' : 'ir-file-input'}
              sectionLabel="IR file"
              accept=".wav"
              Icon={Mic2}
              emptyCta="Choose .wav file"
              displayName={ir.displayName}
              disabled={formDisabled}
              inputRef={ir.inputRef}
              onInputChange={ir.onInputChange}
              onClear={ir.clear}
              clearAriaLabel="Remove IR file"
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={formDisabled}
                onClick={() => void handleSave()}
                className="btn-primary"
              >
                {saveLabel}
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => navigate(cancelPath)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <UploadAmpPreviewPanel previewTone={previewTone} />
      </div>
    </>
  );
}