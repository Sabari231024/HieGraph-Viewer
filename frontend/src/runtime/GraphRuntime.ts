import type { Node, Edge, MarkerType } from '@xyflow/react';
import type { GraphNode } from '../types/Node';
import type { GraphEdge } from '../types/Edge';

/* ------------------------------------------------------------------ */
/*  Neo4j-style colour palette per level                              */
/* ------------------------------------------------------------------ */
const LEVEL_COLORS: Record<number, { bg: string; border: string; text: string; glow: string }> = {
  1: { bg: '#1a2332', border: '#4c8bf5', text: '#e8f0fe', glow: '#4c8bf544' },
  2: { bg: '#1a2e28', border: '#34a853', text: '#e6f4ea', glow: '#34a85344' },
  3: { bg: '#2e1f2e', border: '#ab47bc', text: '#f3e5f5', glow: '#ab47bc44' },
  4: { bg: '#2e2518', border: '#f9a825', text: '#fff8e1', glow: '#f9a82544' },
  5: { bg: '#2e1b1b', border: '#ef5350', text: '#ffebee', glow: '#ef535044' },
  6: { bg: '#1a2e2e', border: '#00bcd4', text: '#e0f7fa', glow: '#00bcd444' },
};

const EXIT_STYLE = { bg: '#3a0000', border: '#ff4444', text: '#ffcccc', glow: '#ff444444' };

/* ------------------------------------------------------------------ */
/*  Convert backend GraphNode → ReactFlow Node                        */
/* ------------------------------------------------------------------ */
export function toFlowNode(node: GraphNode, position?: { x: number; y: number }): Node {
  const isExit = node.is_exit_node;
  const hasState = Object.keys(node.state).length > 0;
  const palette = isExit ? EXIT_STYLE : LEVEL_COLORS[node.level] ?? LEVEL_COLORS[1];

  let nodeType = 'standard';
  if (isExit) nodeType = 'exit';
  else if (hasState) nodeType = 'conditional';

  return {
    id: node.id,
    type: nodeType,
    position: position ?? { x: 0, y: 0 },
    data: {
      label: node.name,
      level: node.level,
      state: node.state,
      isExit: isExit,
      exitFor: node.exit_for,
      palette,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Convert backend GraphEdge → ReactFlow Edge                        */
/* ------------------------------------------------------------------ */
export function toFlowEdge(edge: GraphEdge, index?: number): Edge {
  const id = `e-${edge.source}-${edge.target}-${edge.type}-${index ?? 0}`;

  const base: Edge = {
    id,
    source: edge.source,
    target: edge.target,
    type: edge.type === 'CONDITION' ? 'conditional' : edge.type === 'EXIT' ? 'virtual' : 'normal',
    markerEnd: {
      type: 'arrowclosed' as MarkerType,
      color: edge.type === 'CONDITION' ? '#ab47bc' : edge.type === 'EXIT' ? '#ff4444' : '#4c8bf5',
      width: 20,
      height: 20,
    },
  };

  if (edge.type === 'CONDITION') {
    base.animated = true;
    base.style = { stroke: '#ab47bc', strokeWidth: 2 };
    base.label = (edge as any).condition
      ? `${(edge as any).condition.field} ${(edge as any).condition.operator} ${(edge as any).condition.value}`
      : 'CONDITION';
    base.labelStyle = { fill: '#ce93d8', fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" };
    base.labelBgStyle = { fill: '#1a1a2e', fillOpacity: 0.9 };
    base.labelBgPadding = [6, 4] as [number, number];
    base.labelBgBorderRadius = 4;
  } else if (edge.type === 'EXIT') {
    base.animated = true;
    base.style = { stroke: '#ff4444', strokeDasharray: '5,5', strokeWidth: 1.5 };
  } else {
    base.style = { stroke: '#4c8bf5', strokeWidth: 2 };
  }

  return base;
}
