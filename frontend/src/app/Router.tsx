import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { GraphCanvas } from '../graph/canvas/GraphCanvas';
import { StatePanel } from '../panels/StatePanel';
import { TraversalPanel } from '../panels/TraversalPanel';
import { NodeInspector } from '../panels/NodeInspector';
import { ConditionPanel } from '../panels/ConditionPanel';
import { HistoryPanel } from '../panels/HistoryPanel';
import { useUIStore } from '../store/uiStore';
import { useNavStore } from '../store/navStore';
import { useGraphStore } from '../store/graphStore';
import { handleGoBack, handleInit, handleShowFullGraph, handleNavigateTo } from '../runtime/TraversalRuntime';

function Breadcrumb() {
  const navStack = useNavStore((s) => s.navStack);
  const currentLevel = useNavStore((s) => s.currentLevel);

  const isLast = (i: number) => i === navStack.length - 1;

  return (
    <div className="breadcrumb-bar">
      <button
        className="breadcrumb-item breadcrumb-root"
        onClick={() => handleInit()}
        title="Go to root (Level 1)"
      >
        <span className="breadcrumb-icon">◈</span> Root
      </button>
      {navStack.map((item, i) => (
        <span key={item.id} className="breadcrumb-segment">
          <span className="breadcrumb-arrow">›</span>
          {isLast(i) ? (
            <span className="breadcrumb-item breadcrumb-item--active">
              <span className="breadcrumb-level-tag">L{item.level}</span>
              {item.name}
            </span>
          ) : (
            <button
              className="breadcrumb-item breadcrumb-item--clickable"
              onClick={() => handleNavigateTo(item.id)}
              title={`Jump to Level ${item.level}: ${item.name}`}
            >
              <span className="breadcrumb-level-tag">L{item.level}</span>
              {item.name}
            </button>
          )}
        </span>
      ))}
      <span className="breadcrumb-level-badge">
        {currentLevel === 0 ? 'Full Graph' : `Level ${currentLevel}`}
      </span>
    </div>
  );
}

function EdgeLegend() {
  return (
    <div className="edge-legend">
      <div className="legend-title">Edge Types</div>
      <div className="legend-item">
        <span className="legend-line legend-line--normal" />
        <span>Hierarchical</span>
      </div>
      <div className="legend-item">
        <span className="legend-line legend-line--intra" />
        <span>Intra-level</span>
      </div>
      <div className="legend-item">
        <span className="legend-line legend-line--conditional" />
        <span>Conditional</span>
      </div>
      <div className="legend-item">
        <span className="legend-line legend-line--exit" />
        <span>Exit</span>
      </div>
    </div>
  );
}

function SearchBar() {
  const [query, setQuery] = useState('');
  const nodes = useGraphStore((s) => s.nodes);

  const handleSearch = (val: string) => {
    setQuery(val);
    const lowerVal = val.toLowerCase();
    const updatedNodes = nodes.map((n) => {
      const label = ((n.data?.label as string) ?? '').toLowerCase();
      const match = !val || label.includes(lowerVal);
      return {
        ...n,
        style: {
          ...n.style,
          opacity: match ? 1 : 0.15,
          transition: 'opacity 0.3s ease',
        },
      };
    });
    useGraphStore.getState().setNodes(updatedNodes);
  };

  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        placeholder="Search nodes..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {query && (
        <button className="search-clear" onClick={() => handleSearch('')}>✕</button>
      )}
    </div>
  );
}

function ExplorerPage() {
  const loading = useUIStore((s) => s.loading);
  const error = useUIStore((s) => s.error);
  const panelTab = useUIStore((s) => s.panelTab);
  const setPanelTab = useUIStore((s) => s.setPanelTab);
  const navStack = useNavStore((s) => s.navStack);
  const currentLevel = useNavStore((s) => s.currentLevel);
  const [isFullGraph, setIsFullGraph] = useState(false);

  const tabs = [
    { key: 'state' as const, label: 'State', icon: '⚡' },
    { key: 'traversal' as const, label: 'Traversal', icon: '🔍' },
    { key: 'conditions' as const, label: 'Conditions', icon: '⚙️' },
    { key: 'history' as const, label: 'History', icon: '📜' },
  ];

  const handleFullGraphToggle = async () => {
    if (isFullGraph) {
      // Go back to default level view
      await handleInit();
      setIsFullGraph(false);
    } else {
      await handleShowFullGraph();
      setIsFullGraph(true);
    }
  };

  // Sync full-graph state with navigation (e.g. if user clicks Root breadcrumb)
  if (isFullGraph && currentLevel !== 0) {
    setIsFullGraph(false);
  }

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
        <div className="header-center">
          <SearchBar />
        </div>
        <div className="header-right">
          <button
            className={`fullgraph-button ${isFullGraph ? 'active' : ''}`}
            onClick={handleFullGraphToggle}
            title={isFullGraph ? 'Return to level view' : 'View the entire graph'}
          >
            <span>{isFullGraph ? '⊟' : '⊞'}</span>
            {isFullGraph ? 'Level View' : 'View Full Graph'}
          </button>
          {navStack.length > 0 && !isFullGraph && (
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
          <EdgeLegend />
          <div className="canvas-hint">
            Scroll to zoom • Drag to pan • Double-click node to drill in • Faded nodes are conditional targets
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
