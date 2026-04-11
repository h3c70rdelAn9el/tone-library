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
        <h1 className="font-display text-4xl font-bold uppercase tracking-widest text-brand-text mb-1">
          Add Tone
        </h1>
        <p className="text-brand-subtext text-sm">Save a new tone to your library.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono uppercase tracking-widest text-brand-subtext">
            NAM File (Phase 2)
          </label>
          <div className="flex items-center justify-center border border-dashed border-brand-border rounded-md py-8 text-brand-muted text-sm gap-2">
            <Upload size={16} />
            File upload coming in Phase 2
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-brand-accent text-black font-display font-bold uppercase tracking-widest text-sm px-6 py-2.5 rounded-md hover:bg-brand-accentDim transition-colors"
          >
            Save Tone
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-brand-subtext text-sm px-4 py-2.5 rounded-md hover:text-brand-text transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
