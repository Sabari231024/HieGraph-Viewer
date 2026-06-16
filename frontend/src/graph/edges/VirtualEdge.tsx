import { memo } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

function VirtualEdgeInner(props: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
    curvature: 0.25,
  });

  return (
    <BaseEdge
      id={props.id}
      path={edgePath}
      style={{
        stroke: '#ff4444',
        strokeWidth: 1.5,
        strokeDasharray: '5,5',
        opacity: 0.6,
      }}
      markerEnd={props.markerEnd}
    />
  );
}

export const VirtualEdge = memo(VirtualEdgeInner);
