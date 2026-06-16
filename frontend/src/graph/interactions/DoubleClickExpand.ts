import { handleExpand } from '../../runtime/TraversalRuntime';
import { useTraversalStore } from '../../store/traversalStore';

/**
 * Handler for double-click node expansion.
 * Prevents re-expanding an already expanded node.
 */
export function doubleClickExpand(nodeId: string): void {
  const { isExpanded } = useTraversalStore.getState();
  if (isExpanded(nodeId)) return;
  handleExpand(nodeId);
}
