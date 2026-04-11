import { useContext } from 'react';
import {
  SelectedToneContext,
  type SelectedToneContextValue,
} from '../context/selectedToneContext';

export function useSelectedTone(): SelectedToneContextValue {
  const v = useContext(SelectedToneContext);
  if (!v) {
    throw new Error('useSelectedTone must be used within SelectedToneProvider');
  }
  return v;
}
