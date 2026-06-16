import { handleCollapse } from '../../runtime/TraversalRuntime';
import { useUIStore } from '../../store/uiStore';

/**
 * Handler for exiting a traversal context via an exit node.
 */
export function exitContext(exitNodeId: string): void {
  useUIStore.getState().selectNode(null);
  handleCollapse(exitNodeId);
}
