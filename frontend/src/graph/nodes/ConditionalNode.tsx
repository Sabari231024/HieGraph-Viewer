import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

function ConditionalNodeInner({ data }: NodeProps) {
  const palette = data.palette as any;
  const state = data.state as Record<string, unknown>;
  const stateEntries = Object.entries(state);

  return (
    <div className="neo-node neo-node--conditional" style={{
      '--node-border': palette?.border ?? '#f9a825',
      '--node-bg': palette?.bg ?? '#2e2518',
      '--node-text': palette?.text ?? '#fff8e1',
      '--node-glow': palette?.glow ?? '#f9a82544',
    } as React.CSSProperties}>
      <div className="neo-node-ring neo-node-ring--pulse" />
      <div className="neo-node-content">
        <span className="neo-node-label">{data.label as string}</span>
        <span className="neo-node-badge neo-node-badge--state">⚡ L{data.level as number}</span>
      </div>
      {stateEntries.length > 0 && (
        <div className="neo-node-state-chip">
          {stateEntries.map(([k, v]) => (
            <span key={k} className="neo-state-entry">
              <span className="neo-state-key">{k}</span>
              <span className="neo-state-val">{String(v)}</span>
            </span>
          ))}
        </div>
      )}
      <Handle type="target" position={Position.Top} className="neo-handle" />
      <Handle type="source" position={Position.Bottom} className="neo-handle" />
    </div>
  );
}

export const ConditionalNode = memo(ConditionalNodeInner);
