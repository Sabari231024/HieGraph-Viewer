import { Routes, Route } from 'react-router-dom';
import { GraphCanvas } from '../graph/canvas/GraphCanvas';
import { StatePanel } from '../panels/StatePanel';
import { TraversalPanel } from '../panels/TraversalPanel';
import { NodeInspector } from '../panels/NodeInspector';
import { ConditionPanel } from '../panels/ConditionPanel';
import { HistoryPanel } from '../panels/HistoryPanel';
import { useUIStore } from '../store/uiStore';
import { useNavStore } from '../store/navStore';
import { handleGoBack, handleInit } from '../runtime/TraversalRuntime';

function Breadcrumb() {
  const navStack = useNavStore((s) => s.navStack);
  const currentLevel = useNavStore((s) => s.currentLevel);

  return (
    <div className="breadcrumb-bar">
      <button
        className="breadcrumb-item breadcrumb-root"
        onClick={() => handleInit()}
        title="Go to root"
      >
        <span className="breadcrumb-icon">◈</span> Root
      </button>
      {navStack.map((item, i) => (
        <span key={item.id} className="breadcrumb-segment">
          <span className="breadcrumb-arrow">›</span>
          <span className={`breadcrumb-item ${i === navStack.length - 1 ? 'breadcrumb-item--active' : ''}`}>
            {item.name}
          </span>
        </span>
      ))}
      <span className="breadcrumb-level-badge">Level {currentLevel}</span>
    </div>
  );
}

function ExplorerPage() {
  const loading = useUIStore((s) => s.loading);
  const error = useUIStore((s) => s.error);
  const panelTab = useUIStore((s) => s.panelTab);
  const setPanelTab = useUIStore((s) => s.setPanelTab);
  const navStack = useNavStore((s) => s.navStack);

  const tabs = [
    { key: 'state' as const, label: 'State', icon: '⚡' },
    { key: 'traversal' as const, label: 'Traversal', icon: '🔍' },
    { key: 'conditions' as const, label: 'Conditions', icon: '⚙️' },
    { key: 'history' as const, label: 'History', icon: '📜' },
  ];

  return (
    <div className="explorer-layout">
      {/* Header */}
      <header className="explorer-header">
        <div className="header-left">
          <h1 className="header-title">
            <span className="header-icon">◈</span> Graph Explorer
          </h1>
          <span className="header-subtitle">Hierarchical Stateful Conditional Graph</span>
        </div>
        <div className="header-right">
          {navStack.length > 0 && (
            <button className="back-button" onClick={() => handleGoBack()}>
              <span>←</span> Back
            </button>
          )}
          {loading && <span className="loading-indicator">⟳ Loading…</span>}
          {error && <span className="error-indicator">⚠ {error}</span>}
        </div>
      </header>

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Main content */}
      <div className="explorer-body">
        {/* Graph canvas */}
        <div className="canvas-container">
          <GraphCanvas />
          <div className="canvas-hint">
            Double-click a node to drill in • Use Back button or breadcrumbs to navigate up
          </div>
        </div>

        {/* Side panel */}
        <aside className="side-panel">
          <NodeInspector />

          <div className="panel-tabs">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`panel-tab ${panelTab === t.key ? 'active' : ''}`}
                onClick={() => setPanelTab(t.key)}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          <div className="panel-content">
            {panelTab === 'state' && <StatePanel />}
            {panelTab === 'traversal' && <TraversalPanel />}
            {panelTab === 'conditions' && <ConditionPanel />}
            {panelTab === 'history' && <HistoryPanel />}
          </div>
        </aside>
      </div>
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<ExplorerPage />} />
    </Routes>
  );
}
