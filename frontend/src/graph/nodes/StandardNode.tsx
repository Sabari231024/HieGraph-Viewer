import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

function StandardNodeInner({ data }: NodeProps) {
  const palette = data.palette as any;
  return (
    <div className="neo-node" style={{
      '--node-border': palette?.border ?? '#4c8bf5',
      '--node-bg': palette?.bg ?? '#1a2332',
      '--node-text': palette?.text ?? '#e8f0fe',
      '--node-glow': palette?.glow ?? '#4c8bf544',
    } as React.CSSProperties}>
      <div className="neo-node-ring" />
      <div className="neo-node-content">
        <span className="neo-node-label">{data.label as string}</span>
        <span className="neo-node-badge">L{data.level as number}</span>
      </div>
      <Handle type="target" position={Position.Top} className="neo-handle" />
      <Handle type="source" position={Position.Bottom} className="neo-handle" />
    </div>
  );
}

export const StandardNode = memo(StandardNodeInner);
