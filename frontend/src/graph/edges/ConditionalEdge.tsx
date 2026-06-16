import { memo } from 'react';
import { BaseEdge, getBezierPath, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';

function ConditionalEdgeInner(props: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
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
          stroke: '#ab47bc',
          strokeWidth: 10,
          strokeOpacity: 0.1,
          filter: 'blur(6px)',
        }}
      />
      <BaseEdge
        id={props.id}
        path={edgePath}
        style={{
          stroke: '#ab47bc',
          strokeWidth: 2,
          strokeDasharray: '8,4',
        }}
        markerEnd={props.markerEnd}
      />
      {props.label && (
        <EdgeLabelRenderer>
          <div
            className="neo-edge-label neo-edge-label--condition"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            {props.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const ConditionalEdgeComponent = memo(ConditionalEdgeInner);
