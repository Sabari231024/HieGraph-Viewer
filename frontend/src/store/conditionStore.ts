import { create } from 'zustand';
import type { ConditionalEdge } from '../types/Edge';

interface ConditionStore {
  /** All currently active (satisfied) conditional edges */
  activeConditions: ConditionalEdge[];
  setActiveConditions: (edges: ConditionalEdge[]) => void;
  addConditions: (edges: ConditionalEdge[]) => void;
  removeConditionsForSource: (sourceId: string) => void;
  clear: () => void;
}

export const useConditionStore = create<ConditionStore>((set) => ({
  activeConditions: [],
  setActiveConditions: (edges) => set({ activeConditions: edges }),
  addConditions: (edges) =>
    set((s) => ({ activeConditions: [...s.activeConditions, ...edges] })),
  removeConditionsForSource: (sourceId) =>
    set((s) => ({
      activeConditions: s.activeConditions.filter((e) => e.source !== sourceId),
    })),
  clear: () => set({ activeConditions: [] }),
}));
