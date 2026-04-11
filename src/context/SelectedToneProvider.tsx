import {
  useCallback,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type { Tone } from '../types/tone';
import { SelectedToneContext } from './selectedToneContext';

type State = { selected: Tone | null; previous: Tone | null };
type Action =
  | { type: 'select'; tone: Tone }
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

  const selectTone = useCallback((tone: Tone) => {
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
