import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

function StandardNodeInner({ data }: NodeProps) {
  const palette = data.palette as any;
  const isGhost = data.isGhost as boolean;
  const properties = data.properties as Record<string, unknown> | undefined;
  const propCount = properties ? Object.keys(properties).length : 0;

  return (
    <div className={`neo-node ${isGhost ? 'neo-node--ghost' : ''}`} style={{
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
      {propCount > 0 && !isGhost && (
        <div className="neo-node-prop-badge" title={`${propCount} properties`}>
          🏷 {propCount}
        </div>
      )}
      <Handle type="target" position={Position.Top} className="neo-handle" />
      <Handle type="source" position={Position.Bottom} className="neo-handle" />
    </div>
  );
}

export const StandardNode = memo(StandardNodeInner);
