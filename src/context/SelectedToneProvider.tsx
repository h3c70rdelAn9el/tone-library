import {
  useCallback,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type { ToneCard } from '../types/tone';
import { SelectedToneContext } from './selectedToneContext';

type State = { selected: ToneCard | null; previous: ToneCard | null };
type Action =
  | { type: 'select'; tone: ToneCard }
  | { type: 'clear' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'select':
      return {
        selected: action.tone,
        previous: state.selected,
      };
    case 'clear':
      return {
        selected: null,
        previous: state.selected,
      };
  }
}

export function SelectedToneProvider({ children }: { children: ReactNode }) {
  const [{ selected, previous }, dispatch] = useReducer(reducer, {
    selected: null,
    previous: null,
  });

  const selectTone = useCallback((tone: ToneCard) => {
    dispatch({ type: 'select', tone });
  }, []);

  const clearTone = useCallback(() => {
    dispatch({ type: 'clear' });
  }, []);

  const value = useMemo(
    () => ({
      selectedTone: selected,
      previousTone: previous,
      selectTone,
      clearTone,
    }),
    [selected, previous, selectTone, clearTone],
  );

  return (
    <SelectedToneContext.Provider value={value}>
      {children}
    </SelectedToneContext.Provider>
  );
}
