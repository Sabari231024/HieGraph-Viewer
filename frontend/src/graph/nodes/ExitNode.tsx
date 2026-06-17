import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

function ExitNodeInner({ data }: NodeProps) {
  const isGhost = data.isGhost as boolean;
  return (
    <div className={`neo-node neo-node--exit ${isGhost ? 'neo-node--ghost' : ''}`}>
      <div className="neo-node-ring neo-node-ring--exit" />
      <div className="neo-node-content">
        <span className="neo-exit-icon">↩</span>
        <span className="neo-node-label">{data.label as string}</span>
      </div>
      <Handle type="target" position={Position.Top} className="neo-handle" />
    </div>
  );
}

export const ExitNode = memo(ExitNodeInner);
