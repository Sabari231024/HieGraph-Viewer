import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

function SharedNodeInner({ data }: NodeProps) {
  const palette = data.palette as any;
  return (
    <div
      style={{
        background: palette?.bg ?? '#1a1a2e',
        border: `2px dashed ${palette?.border ?? '#6c63ff'}`,
        borderRadius: 12,
        padding: '12px 20px',
        color: palette?.text ?? '#e0e0ff',
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        fontWeight: 600,
        minWidth: 140,
        textAlign: 'center',
        boxShadow: `0 0 16px ${palette?.border ?? '#6c63ff'}22`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 4 }}>
        L{data.level as number} • SHARED
      </div>
      <div>{data.label as string}</div>
      <Handle type="target" position={Position.Top} style={{ background: palette?.border ?? '#6c63ff' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: palette?.border ?? '#6c63ff' }} />
    </div>
  );
}

export const SharedNode = memo(SharedNodeInner);
