import { useCallback, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { GraphRenderer } from './GraphRenderer';
import { useGraphStore } from '../../store/graphStore';
import { useUIStore } from '../../store/uiStore';
import { useNavStore } from '../../store/navStore';
import { handleInit, handleEnterNode, handleGoBack } from '../../runtime/TraversalRuntime';

export function GraphCanvas() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const currentLevel = useNavStore((s) => s.currentLevel);

  /* ---- Initialize on mount ---- */
  useEffect(() => {
    handleInit();
  }, []);

  /* ---- Double-click: drill into node ---- */
  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      if (node.data?.isExit) {
        handleGoBack();
      } else {
        handleEnterNode(node.id);
      }
    },
    []
  );

  /* ---- Single click: inspect ---- */
  const onNodeClick = useCallback((_event: React.MouseEvent, node: any) => {
    useUIStore.getState().selectNode({
      id: node.id,
      name: node.data?.label ?? node.id,
      level: node.data?.level ?? 0,
      state: node.data?.state ?? {},
      is_exit_node: node.data?.isExit ?? false,
      exit_for: node.data?.exitFor ?? null,
    });
  }, []);

  return (
    <ReactFlowProvider>
      <GraphRenderer
        key={`level-${currentLevel}-${nodes.length}`}
        nodes={nodes}
        edges={edges}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeClick={onNodeClick}
      />
    </ReactFlowProvider>
  );
}
