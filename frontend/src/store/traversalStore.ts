import { create } from 'zustand';
import type { TraversalFrame } from '../types/TraversalFrame';

interface TraversalStore {
  sessionId: string | null;
  stack: TraversalFrame[];
  depth: number;
  expandedNodeIds: Set<string>;
  setSessionId: (id: string) => void;
  setStack: (stack: TraversalFrame[]) => void;
  setDepth: (d: number) => void;
  pushFrame: (frame: TraversalFrame) => void;
  popFrame: (exitNodeId: string) => void;
  markExpanded: (nodeId: string) => void;
  markCollapsed: (nodeId: string) => void;
  isExpanded: (nodeId: string) => boolean;
  clear: () => void;
}

export const useTraversalStore = create<TraversalStore>((set, get) => ({
  sessionId: null,
  stack: [],
  depth: 0,
  expandedNodeIds: new Set<string>(),
  setSessionId: (id) => set({ sessionId: id }),
  setStack: (stack) => set({ stack }),
  setDepth: (d) => set({ depth: d }),
  pushFrame: (frame) =>
    set((s) => ({ stack: [...s.stack, frame], depth: s.depth + 1 })),
  popFrame: (exitNodeId) =>
    set((s) => ({
      stack: s.stack.filter((f) => f.exit_node_id !== exitNodeId),
      depth: Math.max(0, s.depth - 1),
    })),
  markExpanded: (nodeId) =>
    set((s) => {
      const next = new Set(s.expandedNodeIds);
      next.add(nodeId);
      return { expandedNodeIds: next };
    }),
  markCollapsed: (nodeId) =>
    set((s) => {
      const next = new Set(s.expandedNodeIds);
      next.delete(nodeId);
      return { expandedNodeIds: next };
    }),
  isExpanded: (nodeId) => get().expandedNodeIds.has(nodeId),
  clear: () =>
    set({ sessionId: null, stack: [], depth: 0, expandedNodeIds: new Set() }),
}));
