export interface GraphNode {
  id: string;
  name: string;
  level: number;
  state: Record<string, unknown>;
  is_exit_node: boolean;
  exit_for: string | null;
}
