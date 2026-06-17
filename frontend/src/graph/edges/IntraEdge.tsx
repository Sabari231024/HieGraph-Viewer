import { memo } from 'react';
import { BaseEdge, getBezierPath, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';

function IntraEdgeInner(props: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
    curvature: 0.4,
  });

  return (
    <>
      {/* Glow layer */}
      <BaseEdge
        id={`${props.id}-glow`}
        path={edgePath}
        style={{
          stroke: '#26c6da',
          strokeWidth: 12,
          strokeOpacity: 0.1,
          filter: 'blur(6px)',
        }}
      />
      {/* Main edge */}
      <BaseEdge
        id={props.id}
        path={edgePath}
        style={{
          stroke: '#26c6da',
          strokeWidth: 2.5,
          strokeDasharray: '8,4',
          strokeLinecap: 'round',
        }}
        markerEnd={props.markerEnd}
      />
      {props.label && (
        <EdgeLabelRenderer>
          <div
            className="neo-edge-label neo-edge-label--intra"
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

export const IntraEdgeComponent = memo(IntraEdgeInner);
