import { create } from 'zustand';
import type { StateFrame } from '../types/StateFrame';

interface StateStore {
  stack: StateFrame[];
  merged: Record<string, unknown>;
  setStack: (stack: StateFrame[]) => void;
  setMerged: (merged: Record<string, unknown>) => void;
  updateFromResponse: (state: Record<string, unknown>) => void;
  clear: () => void;
}

export const useStateStore = create<StateStore>((set) => ({
  stack: [],
  merged: {},
  setStack: (stack) => set({ stack }),
  setMerged: (merged) => set({ merged }),
  updateFromResponse: (state) => set({ merged: state }),
  clear: () => set({ stack: [], merged: {} }),
}));
