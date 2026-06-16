import { create } from 'zustand';
import type { GraphNode } from '../types/Node';

interface UIStore {
  selectedNode: GraphNode | null;
  inspectorOpen: boolean;
  loading: boolean;
  error: string | null;
  panelTab: 'state' | 'traversal' | 'conditions' | 'history';
  selectNode: (node: GraphNode | null) => void;
  setInspectorOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPanelTab: (tab: UIStore['panelTab']) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selectedNode: null,
  inspectorOpen: false,
  loading: false,
  error: null,
  panelTab: 'state',
  selectNode: (node) => set({ selectedNode: node, inspectorOpen: !!node }),
  setInspectorOpen: (open) => set({ inspectorOpen: open }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPanelTab: (tab) => set({ panelTab: tab }),
}));
