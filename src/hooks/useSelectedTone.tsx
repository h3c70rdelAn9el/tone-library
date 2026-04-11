import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type { Tone } from '../types/tone';

type SelectedToneCtx = {
  selectedTone: Tone | null;
  previousTone: Tone | null;
  selectTone: (tone: Tone) => void;
  clearTone: () => void;
};

const Ctx = createContext<SelectedToneCtx | null>(null);

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

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSelectedTone(): SelectedToneCtx {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error('useSelectedTone must be used within SelectedToneProvider');
  }
  return v;
}
