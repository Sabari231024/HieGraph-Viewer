import { handleCollapse } from '../../runtime/TraversalRuntime';

/**
 * Handler for collapsing a branch via its exit node.
 */
export function collapseBranch(exitNodeId: string): void {
  handleCollapse(exitNodeId);
}
