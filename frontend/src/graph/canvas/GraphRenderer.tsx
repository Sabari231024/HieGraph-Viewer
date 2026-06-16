import { memo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { StandardNode } from '../nodes/StandardNode';
import { ConditionalNode } from '../nodes/ConditionalNode';
import { ExitNode } from '../nodes/ExitNode';
import { NormalEdge } from '../edges/NormalEdge';
import { ConditionalEdgeComponent } from '../edges/ConditionalEdge';
import { VirtualEdge } from '../edges/VirtualEdge';

const nodeTypes: NodeTypes = {
  standard: StandardNode,
  conditional: ConditionalNode,
  exit: ExitNode,
};

const edgeTypes: EdgeTypes = {
  normal: NormalEdge,
  conditional: ConditionalEdgeComponent,
  virtual: VirtualEdge,
};

interface GraphRendererProps {
  nodes: any[];
  edges: any[];
  onNodeDoubleClick: (event: React.MouseEvent, node: any) => void;
  onNodeClick: (event: React.MouseEvent, node: any) => void;
}

function GraphRendererInner({ nodes, edges, onNodeDoubleClick, onNodeClick }: GraphRendererProps) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeDoubleClick={onNodeDoubleClick}
      onNodeClick={onNodeClick}
      fitView
      fitViewOptions={{ padding: 0.4, duration: 500 }}
      minZoom={0.15}
      maxZoom={2.5}
      proOptions={{ hideAttribution: true }}
      style={{ background: '#0d1117' }}
      defaultEdgeOptions={{
        type: 'normal',
      }}
    >
      <Background color="#21262d" gap={24} size={1.5} />
      <Controls
        style={{
          background: '#161b22',
          borderColor: '#30363d',
          color: '#8b949e',
          borderRadius: 8,
        }}
      />
      <MiniMap
        nodeColor={(n) => {
          if (n.data?.isExit) return '#ff4444';
          const palette = n.data?.palette as any;
          return palette?.border ?? '#4c8bf5';
        }}
        style={{ background: '#0d1117', borderColor: '#30363d', borderRadius: 8 }}
        maskColor="rgba(13, 17, 23, 0.75)"
      />
    </ReactFlow>
  );
}

export const GraphRenderer = memo(GraphRendererInner);
