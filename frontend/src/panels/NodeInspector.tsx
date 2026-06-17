import { useUIStore } from '../store/uiStore';

export function NodeInspector() {
  const node = useUIStore((s) => s.selectedNode);

  if (!node) {
    return (
      <div className="panel">
        <h3 className="panel-title">
          <span className="panel-icon">📋</span> Node Inspector
        </h3>
        <div className="panel-empty">Click a node to inspect</div>
      </div>
    );
  }

  const stateEntries = Object.entries(node.state);
  const propEntries = Object.entries(node.properties ?? {});

  return (
    <div className="panel">
      <h3 className="panel-title">
        <span className="panel-icon">📋</span> Node Inspector
      </h3>
      <div className="inspector-content">
        <div className="inspector-row">
          <span className="inspector-label">ID</span>
          <span className="inspector-value mono">{node.id}</span>
        </div>
        <div className="inspector-row">
          <span className="inspector-label">Name</span>
          <span className="inspector-value">{node.name}</span>
        </div>
        <div className="inspector-row">
          <span className="inspector-label">Level</span>
          <span className="inspector-value">
            <span className="level-badge">L{node.level}</span>
          </span>
        </div>
        {node.is_ghost && (
          <div className="inspector-row">
            <span className="inspector-label">Type</span>
            <span className="inspector-value" style={{ color: '#8b949e', fontStyle: 'italic' }}>Ghost (conditional target)</span>
          </div>
        )}
        {node.is_exit_node && (
          <div className="inspector-row">
            <span className="inspector-label">Exit For</span>
            <span className="inspector-value mono">{node.exit_for}</span>
          </div>
        )}
        {stateEntries.length > 0 && (
          <>
            <div className="inspector-divider" />
            <div className="inspector-section-title">Contributes State</div>
            {stateEntries.map(([k, v]) => (
              <div key={k} className="state-row">
                <span className="state-key">{k}</span>
                <span className="state-value">{String(v)}</span>
              </div>
            ))}
          </>
        )}
        {propEntries.length > 0 && (
          <>
            <div className="inspector-divider" />
            <div className="inspector-section-title">🏷 Properties</div>
            {propEntries.map(([k, v]) => (
              <div key={k} className="state-row">
                <span className="state-key">{k}</span>
                <span className="state-value">
                  {Array.isArray(v) ? v.join(', ') : String(v)}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
