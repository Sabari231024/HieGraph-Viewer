import { create } from 'zustand';

interface NavItem {
  id: string;
  name: string;
  level: number;
}

interface JumpEdge {
  source: string;
  target: string;
  type: string;
  target_name: string;
  target_level: number;
  condition: {
    field: string;
    operator: string;
    value: unknown;
  };
}

interface NavStore {
  currentLevel: number;
  navStack: NavItem[];
  jumpEdges: JumpEdge[];
  setCurrentLevel: (level: number) => void;
  setNavStack: (stack: NavItem[]) => void;
  setJumpEdges: (edges: JumpEdge[]) => void;
  setFromResponse: (data: any) => void;
  clear: () => void;
}

export const useNavStore = create<NavStore>((set) => ({
  currentLevel: 1,
  navStack: [],
  jumpEdges: [],
  setCurrentLevel: (level) => set({ currentLevel: level }),
  setNavStack: (stack) => set({ navStack: stack }),
  setJumpEdges: (edges) => set({ jumpEdges: edges }),
  setFromResponse: (data) =>
    set({
      currentLevel: data.current_level ?? 1,
      navStack: data.nav_stack ?? [],
      jumpEdges: data.jump_edges ?? [],
    }),
  clear: () => set({ currentLevel: 1, navStack: [], jumpEdges: [] }),
}));
