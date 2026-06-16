import { useStateStore } from '../store/stateStore';

export function StatePanel() {
  const merged = useStateStore((s) => s.merged);
  const entries = Object.entries(merged);

  return (
    <div className="panel">
      <h3 className="panel-title">
        <span className="panel-icon">⚡</span> Merged State
      </h3>
      {entries.length === 0 ? (
        <div className="panel-empty">No state accumulated yet</div>
      ) : (
        <div className="state-grid">
          {entries.map(([key, value]) => (
            <div key={key} className="state-row">
              <span className="state-key">{key}</span>
              <span className="state-value">{String(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
