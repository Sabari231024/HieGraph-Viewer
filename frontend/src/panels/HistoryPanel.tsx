import { useTraversalStore } from '../store/traversalStore';
import { useGraphStore } from '../store/graphStore';

export function HistoryPanel() {
  const depth = useTraversalStore((s) => s.depth);
  const expandedIds = useTraversalStore((s) => s.expandedNodeIds);
  const nodeCount = useGraphStore((s) => s.nodes.length);
  const edgeCount = useGraphStore((s) => s.edges.length);
  const expanded = Array.from(expandedIds);

  return (
    <div className="panel">
      <h3 className="panel-title">
        <span className="panel-icon">📜</span> History
      </h3>
      <div className="history-stats">
        <div className="stat-item">
          <span className="stat-label">Visible Nodes</span>
          <span className="stat-value">{nodeCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Visible Edges</span>
          <span className="stat-value">{edgeCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Depth</span>
          <span className="stat-value">{depth}</span>
        </div>
      </div>
      {expanded.length > 0 && (
        <>
          <div className="inspector-divider" />
          <div className="inspector-section-title">Expansion Path</div>
          <div className="history-path">
            {expanded.map((id, i) => (
              <span key={id} className="history-step">
                {i > 0 && <span className="history-arrow">→</span>}
                {id}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
