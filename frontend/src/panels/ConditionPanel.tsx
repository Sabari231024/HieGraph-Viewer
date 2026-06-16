import { useConditionStore } from '../store/conditionStore';

export function ConditionPanel() {
  const conditions = useConditionStore((s) => s.activeConditions);

  return (
    <div className="panel">
      <h3 className="panel-title">
        <span className="panel-icon">⚙️</span> Active Conditions
      </h3>
      {conditions.length === 0 ? (
        <div className="panel-empty">No conditions triggered</div>
      ) : (
        <div className="condition-list">
          {conditions.map((c, i) => (
            <div key={i} className="condition-card">
              <div className="condition-route">
                <span className="condition-source">{c.source}</span>
                <span className="condition-arrow">→</span>
                <span className="condition-target">{c.target}</span>
              </div>
              <div className="condition-expr">
                {c.condition.field} {c.condition.operator} {String(c.condition.value)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
