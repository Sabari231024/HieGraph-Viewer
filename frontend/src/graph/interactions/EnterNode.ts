import { useUIStore } from '../../store/uiStore';
import type { GraphNode } from '../../types/Node';

/**
 * Handler for entering/selecting a node (single click).
 */
export function enterNode(node: GraphNode): void {
  useUIStore.getState().selectNode(node);
}
