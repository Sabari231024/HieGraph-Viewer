import { useCallback, useEffect, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { GraphRenderer } from './GraphRenderer';
import { useGraphStore } from '../../store/graphStore';
import { useUIStore } from '../../store/uiStore';
import { useNavStore } from '../../store/navStore';
import { handleInit, handleEnterNode, handleGoBack, handleSwitchParent, getNavParent } from '../../runtime/TraversalRuntime';

const EXIT_STYLE = { bg: '#3a0000', border: '#ff4444', text: '#ffcccc', glow: '#ff444444' };

export function GraphCanvas() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const currentLevel = useNavStore((s) => s.currentLevel);
  const exitNodeIds = useRef<string[]>([]);
  const exitEdgeIds = useRef<string[]>([]);

  useEffect(() => { handleInit(); }, []);

  /** Remove previously added dynamic exit nodes/edges */
  const clearDynamicExits = useCallback(() => {
    if (exitNodeIds.current.length) {
      useGraphStore.getState().removeNodes(exitNodeIds.current);
      exitNodeIds.current = [];
    }
    if (exitEdgeIds.current.length) {
      useGraphStore.getState().removeEdges(exitEdgeIds.current);
      exitEdgeIds.current = [];
    }
  }, []);

  /** Add faded exit nodes for other parents of a multi-parent node */
  const showExitNodes = useCallback((node: any) => {
    clearDynamicExits();

    const parents = (node.data?.parents ?? []) as { id: string; name: string; level: number }[];

    // Exit nodes are ONLY for nodes with multiple parents
    if (parents.length <= 1) return;

    const navParent = getNavParent();

    // Show exit nodes for parents OTHER than the one we navigated through
    const otherParents = parents.filter((p: any) => p.id !== navParent);
    if (otherParents.length === 0) return;

    // Position exit nodes around the clicked node
    const clickedNode = nodes.find((n) => n.id === node.id);
    const baseX = clickedNode?.position?.x ?? 0;
    const baseY = clickedNode?.position?.y ?? 0;

    const newNodes: any[] = [];
    const newEdges: any[] = [];

    otherParents.forEach((p: any, i: number) => {
      const exitId = `__DYN_EXIT_${p.id}_${node.id}`;
      const angle = (-Math.PI / 2) + (i - (otherParents.length - 1) / 2) * 0.6;
      const dist = 220;

      newNodes.push({
        id: exitId,
        type: 'exit',
        position: {
          x: baseX + Math.cos(angle) * dist,
          y: baseY - dist + Math.sin(angle) * 80,
        },
        data: {
          label: `Exit ${p.name}`,
          level: p.level,
          state: {},
          properties: {},
          parents: [],
          isExit: true,
          exitFor: p.id,
          isGhost: true,
          palette: EXIT_STYLE,
        },
      });

      const edgeId = `__DYN_EDGE_${exitId}`;
      newEdges.push({
        id: edgeId,
        source: node.id,
        target: exitId,
        type: 'virtual',
        animated: true,
        style: { stroke: '#ff5555', strokeDasharray: '6,6', strokeWidth: 2, opacity: 0.5 },
      });

      exitNodeIds.current.push(exitId);
      exitEdgeIds.current.push(edgeId);
    });

    useGraphStore.getState().addNodes(newNodes);
    useGraphStore.getState().addEdges(newEdges);
  }, [nodes, clearDynamicExits]);

  /* ---- Double-click: drill into node or navigate via exit ---- */
  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      // Dynamic exit node: switch parent (rebuilds entire nav trace)
      if (node.id?.startsWith('__DYN_EXIT_')) {
        clearDynamicExits();
        const parentId = node.data?.exitFor;
        if (parentId) {
          handleSwitchParent(parentId);
        }
        return;
      }
      if (node.data?.isGhost) return;
      clearDynamicExits();
      handleEnterNode(node.id);
    },
    [clearDynamicExits]
  );

  /* ---- Single click: inspect + show exit nodes ---- */
  const onNodeClick = useCallback((_event: React.MouseEvent, node: any) => {
    // If clicking a dynamic exit or ghost, just inspect
    if (node.id?.startsWith('__DYN_EXIT_') || node.data?.isGhost) {
      useUIStore.getState().selectNode({
        id: node.id,
        name: node.data?.label ?? node.id,
        level: node.data?.level ?? 0,
        state: node.data?.state ?? {},
        properties: node.data?.properties ?? {},
        is_exit_node: node.data?.isExit ?? false,
        exit_for: node.data?.exitFor ?? null,
        is_ghost: node.data?.isGhost ?? false,
      });
      return;
    }

    // Select node for inspector
    useUIStore.getState().selectNode({
      id: node.id,
      name: node.data?.label ?? node.id,
      level: node.data?.level ?? 0,
      state: node.data?.state ?? {},
      properties: node.data?.properties ?? {},
      is_exit_node: node.data?.isExit ?? false,
      exit_for: node.data?.exitFor ?? null,
      is_ghost: node.data?.isGhost ?? false,
      parents: node.data?.parents ?? [],
    });

    // Show dynamic exit nodes for other parents (only if multi-parent)
    showExitNodes(node);
  }, [showExitNodes]);

  /* ---- Pane click: clear exit nodes when clicking empty space ---- */
  const onPaneClick = useCallback(() => {
    clearDynamicExits();
    useUIStore.getState().selectNode(null);
  }, [clearDynamicExits]);

  return (
    <ReactFlowProvider>
      <GraphRenderer
        key={`level-${currentLevel}-${nodes.length}`}
        nodes={nodes}
        edges={edges}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
      />
    </ReactFlowProvider>
  );
}
