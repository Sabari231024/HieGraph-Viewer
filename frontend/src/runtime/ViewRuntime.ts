import { useGraphStore } from '../store/graphStore';
import { useTraversalStore } from '../store/traversalStore';
import { useStateStore } from '../store/stateStore';
import { fetchCurrentView } from '../services/graphApi';
import { toFlowNode, toFlowEdge } from './GraphRuntime';
import { computeLayout } from '../graph/canvas/LayoutEngine';
import type { GraphNode } from '../types/Node';

/**
 * Refresh the entire visible view from the backend (full sync).
 */
export async function refreshView() {
  const { sessionId } = useTraversalStore.getState();
  if (!sessionId) return;

  const data = await fetchCurrentView(sessionId);

  const flowNodes = (data.nodes as GraphNode[]).map((n) => toFlowNode(n));
  const flowEdges = data.edges.map((e: any, i: number) => toFlowEdge(e, i));

  const laid = computeLayout(flowNodes, flowEdges);
  useGraphStore.getState().setNodes(laid.nodes);
  useGraphStore.getState().setEdges(flowEdges);
  useStateStore.getState().updateFromResponse(data.state);
  useTraversalStore.getState().setDepth(data.traversal_depth);
}
