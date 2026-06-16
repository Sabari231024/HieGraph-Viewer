export interface TraversalFrame {
  id: string;
  expanded_node_id: string;
  revealed_node_ids: string[];
  exit_node_id: string;
  frame_type: 'normal' | 'conditional';
}
