"""
Shared dependencies: graph service singleton and session store.
"""
import uuid
from pathlib import Path
from typing import Dict, Tuple

from app.core.graph_loader import GraphLoader
from app.core.graph_service import GraphService
from app.core.traversal_engine import TraversalEngine

# ------------------------------------------------------------------ #
#  Graph Service Singleton (loaded once at startup)
# ------------------------------------------------------------------ #

_GRAPH_PATH = Path(__file__).resolve().parent.parent / "data" / "graph.json"

_loader = GraphLoader(str(_GRAPH_PATH))
_nodes, _edges, _conditional_edges = _loader.load()
graph_service = GraphService(_nodes, _edges, _conditional_edges)

# ------------------------------------------------------------------ #
#  Session Store (in-memory, one TraversalEngine per session)
# ------------------------------------------------------------------ #

session_store: Dict[str, TraversalEngine] = {}


def get_or_create_session(
    session_id: str | None = None,
) -> Tuple[str, TraversalEngine]:
    """Return an existing session or create a new one."""
    if session_id and session_id in session_store:
        return session_id, session_store[session_id]

    new_id = session_id or uuid.uuid4().hex
    engine = TraversalEngine(graph_service)
    session_store[new_id] = engine
    return new_id, engine
