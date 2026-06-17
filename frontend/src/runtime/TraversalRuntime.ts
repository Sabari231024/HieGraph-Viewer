import { useGraphStore } from '../store/graphStore';
import { useTraversalStore } from '../store/traversalStore';
import { useStateStore } from '../store/stateStore';
import { useConditionStore } from '../store/conditionStore';
import { useUIStore } from '../store/uiStore';
import { useNavStore } from '../store/navStore';
import { enterNode, goBack, navigateTo, switchParent } from '../services/traversalApi';
import { fetchLevelView, fetchFullGraph } from '../services/graphApi';
import { toFlowNode, toFlowEdge } from './GraphRuntime';
import { computeLayout, computeHierarchicalLayout } from '../graph/canvas/LayoutEngine';
import type { GraphNode } from '../types/Node';
import type { ConditionalEdge } from '../types/Edge';

/** Tracks which parent we navigated through (set by backend) */
let currentNavParent: string | null = null;
export function getNavParent() { return currentNavParent; }

/* ------------------------------------------------------------------ */
/*  Apply a level-view API response to stores (full replace)          */
/* ------------------------------------------------------------------ */
function applyLevelView(data: any) {
  // Store the nav parent for dynamic exit node logic
  currentNavParent = data.nav_parent ?? null;

  // Primary nodes (same level only)
  const primaryNodes = (data.nodes as GraphNode[]).map((n: GraphNode) => toFlowNode(n));

  // Ghost nodes (conditional targets outside level — the ONLY exception)
  const ghostNodes = (data.ghost_nodes ?? []).map((n: any) =>
    toFlowNode({ ...n, is_ghost: true } as GraphNode)
  );

  const allFlowNodes = [...primaryNodes, ...ghostNodes];

  // Primary edges (within level)
  const flowEdges = (data.edges ?? []).map((e: any, i: number) => toFlowEdge(e, i));

  // Within-level conditional edges
  const condFlowEdges = (data.conditional_edges ?? []).map((e: any, i: number) =>
    toFlowEdge({ ...e, type: 'CONDITION' }, i + 1000)
  );

  // Ghost conditional edges (to ghost nodes)
  const ghostCondEdges = (data.ghost_conditional_edges ?? []).map((e: any, i: number) =>
    toFlowEdge({ ...e, type: 'CONDITION' }, i + 2000)
  );

  const allEdges = [...flowEdges, ...condFlowEdges, ...ghostCondEdges];

  // Layout
  const laid = computeLayout(allFlowNodes, allEdges);

  useGraphStore.getState().setNodes(laid.nodes);
  useGraphStore.getState().setEdges(allEdges);

  // Update state
  useStateStore.getState().updateFromResponse(data.state ?? {});

  // Update conditions
  const allCondEdgeData = [
    ...(data.conditional_edges ?? []),
    ...(data.ghost_conditional_edges ?? []),
  ];
  if (allCondEdgeData.length) {
    useConditionStore.getState().setActiveConditions(allCondEdgeData as ConditionalEdge[]);
  } else {
    useConditionStore.getState().clear();
  }

  // Update nav
  useNavStore.getState().setFromResponse(data);

  // Clear selection & exit nodes
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

    const laid = computeHierarchicalLayout(flowNodes, allEdges);
    useGraphStore.getState().setNodes(laid.nodes);
    useGraphStore.getState().setEdges(allEdges);

    useStateStore.getState().updateFromResponse(data.state ?? {});
    useConditionStore.getState().clear();
    useNavStore.getState().setFromResponse({ ...data, current_level: 0, nav_stack: [] });
    useUIStore.getState().selectNode(null);
    currentNavParent = null;
  } catch (err: any) {
    useUIStore.getState().setError(err.message || 'Full graph failed');
  } finally {
    useUIStore.getState().setLoading(false);
  }
}

/* ------------------------------------------------------------------ */
/*  Navigate to breadcrumb: jump to any point in nav stack            */
/* ------------------------------------------------------------------ */
export async function handleNavigateTo(nodeId: string) {
  const { sessionId } = useTraversalStore.getState();
  if (!sessionId) return;

  useUIStore.getState().setLoading(true);
  useUIStore.getState().setError(null);

  try {
    const data = await navigateTo(nodeId, sessionId);
    applyLevelView(data);
  } catch (err: any) {
    useUIStore.getState().setError(err.message || 'Navigation failed');
  } finally {
    useUIStore.getState().setLoading(false);
  }
}

/* ------------------------------------------------------------------ */
/*  Switch parent: rebuild trace through alternate parent              */
/* ------------------------------------------------------------------ */
export async function handleSwitchParent(parentId: string) {
  const { sessionId } = useTraversalStore.getState();
  if (!sessionId) return;

  useUIStore.getState().setLoading(true);
  useUIStore.getState().setError(null);

  try {
    const data = await switchParent(parentId, sessionId);
    applyLevelView(data);
  } catch (err: any) {
    useUIStore.getState().setError(err.message || 'Switch parent failed');
  } finally {
    useUIStore.getState().setLoading(false);
  }
}

export async function handleExpand(nodeId: string) { return handleEnterNode(nodeId); }
export async function handleCollapse(_exitNodeId: string) { return handleGoBack(); }
