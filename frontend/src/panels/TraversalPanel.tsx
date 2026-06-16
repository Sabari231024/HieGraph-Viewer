import { useTraversalStore } from '../store/traversalStore';

export function TraversalPanel() {
  const depth = useTraversalStore((s) => s.depth);
  const expandedIds = useTraversalStore((s) => s.expandedNodeIds);
  const expanded = Array.from(expandedIds);

  return (
    <div className="panel">
      <h3 className="panel-title">
        <span className="panel-icon">🔍</span> Traversal
      </h3>
      <div className="traversal-depth">
        Depth: <span className="depth-badge">{depth}</span>
      </div>
      {expanded.length === 0 ? (
        <div className="panel-empty">No nodes expanded</div>
      ) : (
        <div className="traversal-list">
          {expanded.map((id, i) => (
            <div key={id} className="traversal-item">
              <span className="traversal-index">{i + 1}</span>
              <span className="traversal-id">{id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
