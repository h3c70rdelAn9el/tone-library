import { createContext } from 'react';
import type { ToneCard } from '../types/tone';

export type SelectedToneContextValue = {
  selectedTone: ToneCard | null;
  previousTone: ToneCard | null;
  selectTone: (tone: ToneCard) => void;
  clearTone: () => void;
};

export const SelectedToneContext =
  createContext<SelectedToneContextValue | null>(null);
