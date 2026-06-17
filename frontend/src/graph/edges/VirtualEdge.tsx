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
    curvature: 0.3,
  });

  return (
    <>
      <BaseEdge
        id={`${props.id}-glow`}
        path={edgePath}
        style={{
          stroke: '#ff5555',
          strokeWidth: 10,
          strokeOpacity: 0.1,
          filter: 'blur(5px)',
        }}
      />
      <BaseEdge
        id={props.id}
        path={edgePath}
        style={{
          stroke: '#ff5555',
          strokeWidth: 2.5,
          strokeDasharray: '6,6',
          opacity: 0.8,
          strokeLinecap: 'round',
        }}
        markerEnd={props.markerEnd}
      />
    </>
  );
}

export const VirtualEdge = memo(VirtualEdgeInner);
