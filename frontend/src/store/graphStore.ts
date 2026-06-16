import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';

interface GraphStore {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNodes: (nodes: Node[]) => void;
  addEdges: (edges: Edge[]) => void;
  removeNodes: (ids: string[]) => void;
  removeEdges: (ids: string[]) => void;
  clear: () => void;
}

export const useGraphStore = create<GraphStore>((set) => ({
  nodes: [],
  edges: [],
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  addNodes: (newNodes) =>
    set((s) => {
      const existingIds = new Set(s.nodes.map((n) => n.id));
      const unique = newNodes.filter((n) => !existingIds.has(n.id));
      return { nodes: [...s.nodes, ...unique] };
    }),
  addEdges: (newEdges) =>
    set((s) => {
      const existingIds = new Set(s.edges.map((e) => e.id));
      const unique = newEdges.filter((e) => !existingIds.has(e.id));
      return { edges: [...s.edges, ...unique] };
    }),
  removeNodes: (ids) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => !ids.includes(n.id)),
    })),
  removeEdges: (ids) =>
    set((s) => ({
      edges: s.edges.filter((e) => !ids.includes(e.id)),
    })),
  clear: () => set({ nodes: [], edges: [] }),
}));
