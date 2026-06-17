export interface ParentInfo {
  id: string;
  name: string;
  level: number;
}

export interface GraphNode {
  id: string;
  name: string;
  level: number;
  state: Record<string, unknown>;
  properties: Record<string, unknown>;
  is_exit_node: boolean;
  exit_for: string | null;
  is_ghost?: boolean;
  parents?: ParentInfo[];
}
