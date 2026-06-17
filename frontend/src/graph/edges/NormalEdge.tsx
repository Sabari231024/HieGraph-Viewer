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
    curvature: 0.3,
  });

  return (
    <>
      {/* Wide glow layer */}
      <BaseEdge
        id={`${props.id}-glow`}
        path={edgePath}
        style={{
          stroke: '#4c8bf5',
          strokeWidth: 14,
          strokeOpacity: 0.12,
          filter: 'blur(6px)',
        }}
      />
      {/* Main edge */}
      <BaseEdge
        id={props.id}
        path={edgePath}
        style={{ stroke: '#5a9aff', strokeWidth: 3, strokeLinecap: 'round' }}
        markerEnd={props.markerEnd}
      />
    </>
  );
}

export const NormalEdge = memo(NormalEdgeInner);
