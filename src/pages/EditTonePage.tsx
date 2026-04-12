import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToneStore } from '../store/useToneStore';
import ToneEditorForm from '../components/ToneEditorForm';

export default function EditTonePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const tone = useToneStore((s) => (id ? s.getToneById(id) : undefined));

  const isGuest = !authLoading && !user;

  if (!tone) {
    return (
      <div className="p-8 font-body text-sm text-brand-subtext">
        Tone not found.{' '}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-brand-accent underline"
        >
          Go back
        </button>
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-8">
        <p className="font-body text-sm text-brand-text">
          Sign in to edit tones.
        </p>
        <button
          type="button"
          onClick={() => void signInWithGoogle()}
          className="btn-primary-sm w-fit"
        >
          Sign in with Google
        </button>
        <button
          type="button"
          onClick={() => navigate(`/tone/${tone.id}`)}
          className="text-sm text-brand-subtext underline underline-offset-2 transition-all duration-plugin ease-plugin hover:text-brand-text"
        >
          Back to tone
        </button>
      </div>
    );
  }

  return <ToneEditorForm variant="edit" tone={tone} />;
}
