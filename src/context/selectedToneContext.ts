import { createContext } from 'react';
import type { Tone } from '../types/tone';

export type SelectedToneContextValue = {
  selectedTone: Tone | null;
  previousTone: Tone | null;
  selectTone: (tone: Tone) => void;
  clearTone: () => void;
};

export const SelectedToneContext =
  createContext<SelectedToneContextValue | null>(null);
