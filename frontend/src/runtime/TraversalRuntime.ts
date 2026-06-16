import { useGraphStore } from '../store/graphStore';
import { useTraversalStore } from '../store/traversalStore';
import { useStateStore } from '../store/stateStore';
import { useConditionStore } from '../store/conditionStore';
import { useUIStore } from '../store/uiStore';
import { useNavStore } from '../store/navStore';
import { enterNode, goBack } from '../services/traversalApi';
import { fetchLevelView, fetchFullGraph } from '../services/graphApi';
import { toFlowNode, toFlowEdge } from './GraphRuntime';
import { computeLayout, computeHierarchicalLayout } from '../graph/canvas/LayoutEngine';
import type { GraphNode } from '../types/Node';
import type { ConditionalEdge } from '../types/Edge';

/* ------------------------------------------------------------------ */
/*  Apply a level-view API response to stores (full replace)          */
/* ------------------------------------------------------------------ */
function applyLevelView(data: any) {
  const flowNodes = (data.nodes as GraphNode[]).map((n: GraphNode) => toFlowNode(n));
  const flowEdges = (data.edges ?? []).map((e: any, i: number) => toFlowEdge(e, i));
  const condFlowEdges = (data.conditional_edges ?? []).map((e: any, i: number) =>
    toFlowEdge({ ...e, type: 'CONDITION' }, i + 1000)
  );
  const allEdges = [...flowEdges, ...condFlowEdges];

  // Layout all nodes for this level
  const laid = computeLayout(flowNodes, allEdges);

  // Full replace — only this level shown
  useGraphStore.getState().setNodes(laid.nodes);
  useGraphStore.getState().setEdges(allEdges);

  // Update state
  useStateStore.getState().updateFromResponse(data.state ?? {});

  // Update conditions
  if (data.conditional_edges?.length) {
    useConditionStore.getState().setActiveConditions(data.conditional_edges as ConditionalEdge[]);
  } else {
    useConditionStore.getState().clear();
  }

  // Update nav
  useNavStore.getState().setFromResponse(data);

  // Clear selection
  useUIStore.getState().selectNode(null);
}

/* ------------------------------------------------------------------ */
/*  Initialize: fetch level 1 view                                    */
/* ------------------------------------------------------------------ */
export async function handleInit(): Promise<string | null> {
  useUIStore.getState().setLoading(true);
  useUIStore.getState().setError(null);

  try {
    const data = await fetchLevelView();
    useTraversalStore.getState().setSessionId(data.session_id);
    applyLevelView(data);
    return data.session_id;
  } catch (err: any) {
    useUIStore.getState().setError(err.message || 'Init failed');
    return null;
  } finally {
    useUIStore.getState().setLoading(false);
  }
}

/* ------------------------------------------------------------------ */
/*  Enter a node: drill down to show only its children                */
/* ------------------------------------------------------------------ */
export async function handleEnterNode(nodeId: string) {
  const { sessionId } = useTraversalStore.getState();
  if (!sessionId) return;

  useUIStore.getState().setLoading(true);
  useUIStore.getState().setError(null);

  try {
    const data = await enterNode(nodeId, sessionId);
    applyLevelView(data);
  } catch (err: any) {
    const msg = err.message || 'Enter failed';
    // If it's a "no sub-levels" error, show it briefly as info, not a blocking error
    if (msg.includes('no sub-levels')) {
      useUIStore.getState().setError('ℹ️ This node has no sub-levels');
      setTimeout(() => useUIStore.getState().setError(null), 2500);
    } else {
      useUIStore.getState().setError(msg);
    }
  } finally {
    useUIStore.getState().setLoading(false);
  }
}

/* ------------------------------------------------------------------ */
/*  Go back: drill up to show parent's children                       */
/* ------------------------------------------------------------------ */
export async function handleGoBack() {
  const { sessionId } = useTraversalStore.getState();
  if (!sessionId) return;

  useUIStore.getState().setLoading(true);
  useUIStore.getState().setError(null);

  try {
    const data = await goBack(sessionId);
    applyLevelView(data);
  } catch (err: any) {
    useUIStore.getState().setError(err.message || 'Back failed');
  } finally {
    useUIStore.getState().setLoading(false);
  }
}

/* ------------------------------------------------------------------ */
/*  Full Graph: show ALL nodes and edges (hierarchical layout)        */
/* ------------------------------------------------------------------ */
export async function handleShowFullGraph() {
  const { sessionId } = useTraversalStore.getState();

  useUIStore.getState().setLoading(true);
  useUIStore.getState().setError(null);

  try {
    const data = await fetchFullGraph(sessionId ?? undefined);
    if (data.session_id) {
      useTraversalStore.getState().setSessionId(data.session_id);
    }

    const flowNodes = (data.nodes as GraphNode[]).map((n: GraphNode) => toFlowNode(n));
    const flowEdges = (data.edges ?? []).map((e: any, i: number) => toFlowEdge(e, i));
    const condFlowEdges = (data.conditional_edges ?? []).map((e: any, i: number) =>
      toFlowEdge({ ...e, type: 'CONDITION' }, i + 1000)
    );
    const allEdges = [...flowEdges, ...condFlowEdges];

    // Use hierarchical layout for full graph
    const laid = computeHierarchicalLayout(flowNodes, allEdges);
    useGraphStore.getState().setNodes(laid.nodes);
    useGraphStore.getState().setEdges(allEdges);

    useStateStore.getState().updateFromResponse(data.state ?? {});
    useConditionStore.getState().clear();
    useNavStore.getState().setFromResponse({ ...data, current_level: 0, nav_stack: [] });
    useUIStore.getState().selectNode(null);
  } catch (err: any) {
    useUIStore.getState().setError(err.message || 'Full graph failed');
  } finally {
    useUIStore.getState().setLoading(false);
  }
}

/* ------------------------------------------------------------------ */
/*  Legacy stubs                                                      */
/* ------------------------------------------------------------------ */
export async function handleExpand(nodeId: string) {
  return handleEnterNode(nodeId);
}

export async function handleCollapse(_exitNodeId: string) {
  return handleGoBack();
}
