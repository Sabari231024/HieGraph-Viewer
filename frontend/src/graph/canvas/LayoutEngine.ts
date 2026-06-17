import type { Node, Edge } from '@xyflow/react';

const NODE_SPACING = 340;
const CIRCLE_RADIUS_BASE = 280;
const CIRCLE_RADIUS_PER_NODE = 80;

/**
 * Single-level radial layout: since we only show one level at a time,
 * arrange nodes in a circle or grid depending on count.
 */
export function computeLayout(
  nodes: Node[],
  _edges: Edge[]
): { nodes: Node[] } {
  const count = nodes.length;

  if (count === 0) return { nodes };

  // For very small sets, use horizontal line
  if (count <= 3) {
    const totalWidth = count * NODE_SPACING;
    const startX = -totalWidth / 2 + NODE_SPACING / 2;
    return {
      nodes: nodes.map((n, i) => ({
        ...n,
        position: { x: startX + i * NODE_SPACING, y: 200 },
      })),
    };
  }

  // For medium sets, use circular layout (like Neo4j)
  if (count <= 14) {
    const radius = CIRCLE_RADIUS_BASE + count * CIRCLE_RADIUS_PER_NODE;
    const angleStep = (2 * Math.PI) / count;
    const startAngle = -Math.PI / 2; // Start from top

    return {
      nodes: nodes.map((n, i) => {
        const angle = startAngle + i * angleStep;
        return {
          ...n,
          position: {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius + radius,
          },
        };
      }),
    };
  }

  // For large sets, use grid layout
  const cols = Math.ceil(Math.sqrt(count * 1.5));
  const gridSpacingX = NODE_SPACING;
  const gridSpacingY = 300;
  const totalWidth = cols * gridSpacingX;
  const offsetX = -totalWidth / 2;

  return {
    nodes: nodes.map((n, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const rowOffset = row % 2 === 1 ? gridSpacingX / 2 : 0;
      return {
        ...n,
        position: {
          x: offsetX + col * gridSpacingX + rowOffset,
          y: row * gridSpacingY + 100,
        },
      };
    }),
  };
}

/* ------------------------------------------------------------------ */
/*  Hierarchical layout for full-graph view                           */
/* ------------------------------------------------------------------ */

const HIER_Y_GAP = 320;
const HIER_X_GAP = 280;

export function computeHierarchicalLayout(
  nodes: Node[],
  _edges: Edge[]
): { nodes: Node[] } {
  // Group by level
  const levels: Record<number, Node[]> = {};
  for (const n of nodes) {
    const lvl = (n.data?.level as number) ?? 0;
    if (!levels[lvl]) levels[lvl] = [];
    levels[lvl].push(n);
  }

  const sortedLevels = Object.keys(levels)
    .map(Number)
    .sort((a, b) => a - b);

  const positioned = nodes.map((n) => {
    const lvl = (n.data?.level as number) ?? 0;
    const group = levels[lvl];
    const idx = group.indexOf(n);
    const totalInLevel = group.length;
    const levelIdx = sortedLevels.indexOf(lvl);

    const totalWidth = totalInLevel * HIER_X_GAP;
    const offsetX = -totalWidth / 2 + HIER_X_GAP / 2;

    return {
      ...n,
      position: {
        x: offsetX + idx * HIER_X_GAP,
        y: levelIdx * HIER_Y_GAP + 60,
      },
    };
  });

  return { nodes: positioned };
}
