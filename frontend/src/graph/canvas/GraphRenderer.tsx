import { memo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
  type EdgeTypes,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { StandardNode } from '../nodes/StandardNode';
import { ConditionalNode } from '../nodes/ConditionalNode';
import { ExitNode } from '../nodes/ExitNode';
import { NormalEdge } from '../edges/NormalEdge';
import { ConditionalEdgeComponent } from '../edges/ConditionalEdge';
import { VirtualEdge } from '../edges/VirtualEdge';
import { IntraEdgeComponent } from '../edges/IntraEdge';

const nodeTypes: NodeTypes = {
  standard: StandardNode,
  conditional: ConditionalNode,
  exit: ExitNode,
};

const edgeTypes: EdgeTypes = {
  normal: NormalEdge,
  conditional: ConditionalEdgeComponent,
  virtual: VirtualEdge,
  intra: IntraEdgeComponent,
};

interface GraphRendererProps {
  nodes: any[];
  edges: any[];
  onNodeDoubleClick: (event: React.MouseEvent, node: any) => void;
  onNodeClick: (event: React.MouseEvent, node: any) => void;
  onPaneClick?: () => void;
}

function GraphRendererInner({ nodes, edges, onNodeDoubleClick, onNodeClick, onPaneClick }: GraphRendererProps) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeDoubleClick={onNodeDoubleClick}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      fitView
      fitViewOptions={{ padding: 0.35, duration: 600 }}
      minZoom={0.05}
      maxZoom={3}
      proOptions={{ hideAttribution: true }}
      style={{ background: '#0a0e14' }}
      defaultEdgeOptions={{
        type: 'normal',
      }}
      connectionLineType={ConnectionLineType.SmoothStep}
      nodesDraggable={true}
      panOnScroll={false}
      zoomOnScroll={true}
      panOnDrag={true}
      selectNodesOnDrag={false}
    >
      <Background color="#1e2530" gap={28} size={1.5} />
      <Controls
        style={{
          background: '#12171f',
          borderColor: '#2a3140',
          color: '#8b949e',
          borderRadius: 10,
        }}
        showInteractive={false}
      />
      <MiniMap
        nodeColor={(n) => {
          if (n.data?.isGhost) return '#ffffff22';
          if (n.data?.isExit) return '#ff5555';
          const palette = n.data?.palette as any;
          return palette?.border ?? '#4c8bf5';
        }}
        style={{ background: '#0a0e14', borderColor: '#2a3140', borderRadius: 10 }}
        maskColor="rgba(10, 14, 20, 0.75)"
        pannable
        zoomable
      />
    </ReactFlow>
  );
}

export const GraphRenderer = memo(GraphRendererInner);
