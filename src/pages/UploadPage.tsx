import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';

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
] as const;

export default function UploadPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(`Tone "${name}" would be saved here in Phase 2.`);
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-body font-semibold uppercase tracking-wide text-brand-subtext">
            Tone Name *
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Metal Rhythm Tight"
            className="bg-brand-card border border-brand-border rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-colors"
          />
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
            {AVAILABLE_TAGS.map((tag) => (
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
            NAM File (Phase 2)
          </label>
          <div className="flex items-center justify-center border border-dashed border-brand-border rounded-2xl py-8 text-brand-muted text-sm gap-2">
            <Upload size={16} />
            File upload coming in Phase 2
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
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
      </form>
    </div>
  );
}
