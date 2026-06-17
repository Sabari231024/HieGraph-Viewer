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
  7: { bg: '#2a1a2e', border: '#e040fb', text: '#fce4ec', glow: '#e040fb44' },
};

const EXIT_STYLE = { bg: '#3a0000', border: '#ff4444', text: '#ffcccc', glow: '#ff444444' };

/* ------------------------------------------------------------------ */
/*  Convert backend GraphNode → ReactFlow Node                        */
/* ------------------------------------------------------------------ */
export function toFlowNode(node: GraphNode, position?: { x: number; y: number }): Node {
  const isExit = node.is_exit_node;
  const isGhost = node.is_ghost ?? false;
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
      properties: node.properties ?? {},
      parents: node.parents ?? [],
      isExit: isExit,
      exitFor: node.exit_for,
      isGhost: isGhost,
      palette,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Convert backend GraphEdge → ReactFlow Edge                        */
/* ------------------------------------------------------------------ */
export function toFlowEdge(edge: GraphEdge, index?: number): Edge {
  const id = `e-${edge.source}-${edge.target}-${edge.type}-${index ?? 0}`;

  let edgeType = 'normal';
  let markerColor = '#5a9aff';

  if (edge.type === 'CONDITION') {
    edgeType = 'conditional';
    markerColor = '#c060dd';
  } else if (edge.type === 'EXIT') {
    edgeType = 'virtual';
    markerColor = '#ff5555';
  } else if (edge.type === 'INTRA') {
    edgeType = 'intra';
    markerColor = '#26c6da';
  }

  const base: Edge = {
    id,
    source: edge.source,
    target: edge.target,
    type: edgeType,
    markerEnd: {
      type: 'arrowclosed' as MarkerType,
      color: markerColor,
      width: 24,
      height: 24,
    },
  };

  if (edge.type === 'CONDITION') {
    base.animated = true;
    base.style = { stroke: '#c060dd', strokeWidth: 3 };
    base.label = (edge as any).condition
      ? `${(edge as any).condition.field} ${(edge as any).condition.operator} ${(edge as any).condition.value}`
      : 'CONDITION';
    base.labelStyle = { fill: '#ce93d8', fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" };
    base.labelBgStyle = { fill: '#1a1a2e', fillOpacity: 0.92 };
    base.labelBgPadding = [8, 5] as [number, number];
    base.labelBgBorderRadius = 6;
  } else if (edge.type === 'EXIT') {
    base.animated = true;
    base.style = { stroke: '#ff5555', strokeDasharray: '6,6', strokeWidth: 2.5 };
  } else if (edge.type === 'INTRA') {
    base.style = { stroke: '#26c6da', strokeWidth: 2.5, strokeDasharray: '8,4' };
    if (edge.label) {
      base.label = edge.label;
      base.labelStyle = { fill: '#80deea', fontSize: 10, fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" };
      base.labelBgStyle = { fill: '#0a1a1e', fillOpacity: 0.9 };
      base.labelBgPadding = [6, 4] as [number, number];
      base.labelBgBorderRadius = 4;
    }
  } else {
    base.style = { stroke: '#5a9aff', strokeWidth: 3 };
  }

  return base;
}
