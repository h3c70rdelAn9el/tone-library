import { useCallback, useRef, useState, type ChangeEvent } from 'react';

/**
 * Local file picker state: display filename, File for upload, object URL for previews.
 * Revokes blob URLs on replace and clear.
 */
export function useFilePickState() {
  const inputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const revokeCurrentUrl = () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  };

  const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    revokeCurrentUrl();
    if (!picked) {
      setDisplayName('');
      setObjectUrl(null);
      setFile(null);
      return;
    }
    const nextUrl = URL.createObjectURL(picked);
    urlRef.current = nextUrl;
    setFile(picked);
    setDisplayName(picked.name);
    setObjectUrl(nextUrl);
  }, []);

  const clear = useCallback(() => {
    revokeCurrentUrl();
    setDisplayName('');
    setObjectUrl(null);
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  return {
    inputRef,
    displayName,
    file,
    objectUrl,
    onInputChange,
    clear,
  };
}
