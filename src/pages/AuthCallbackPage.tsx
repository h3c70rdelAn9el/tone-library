import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [message] = useState('Signing you in...');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href,
      );
      if (cancelled) return;
      if (error) console.error(error);
      navigate('/', { replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-bg px-6">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-border border-t-brand-accent" />
      <p className="mt-6 font-mono text-sm text-brand-muted">{message}</p>
    </div>
  );
}
