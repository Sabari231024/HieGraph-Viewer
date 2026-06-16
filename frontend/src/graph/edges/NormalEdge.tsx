import { memo } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

function NormalEdgeInner(props: EdgeProps) {
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
    <>
      {/* Glow layer */}
      <BaseEdge
        id={`${props.id}-glow`}
        path={edgePath}
        style={{
          stroke: '#4c8bf5',
          strokeWidth: 8,
          strokeOpacity: 0.08,
          filter: 'blur(4px)',
        }}
      />
      <BaseEdge
        id={props.id}
        path={edgePath}
        style={{ stroke: '#4c8bf5', strokeWidth: 2 }}
        markerEnd={props.markerEnd}
      />
    </>
  );
}

export const NormalEdge = memo(NormalEdgeInner);
