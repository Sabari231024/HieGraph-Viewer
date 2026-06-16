from fastapi import APIRouter, HTTPException, Query

from app.core.dependencies import get_or_create_session, session_store, graph_service
from app.core.view_builder import ViewBuilder

router = APIRouter(prefix="/api/graph", tags=["graph"])


@router.get("/init")
def init_graph(session_id: str = Query(default=None)):
    """
    Initialize a graph exploration session.
    Returns Level 1 nodes and a session_id.
    """
    session_id, engine = get_or_create_session(session_id)
    nodes, edges = engine.initialize()
    return ViewBuilder.build_init_view(session_id, nodes, edges)


@router.get("/view")
def get_current_view(session_id: str = Query(...)):
    """Return the full current view (all visible nodes and edges)."""
    if session_id not in session_store:
        raise HTTPException(status_code=404, detail="Session not found")

    engine = session_store[session_id]
    nodes, edges = engine.get_visible_view()
    state = engine.get_merged_state()
    depth = len(engine.traversal_stack)
    return ViewBuilder.build_full_view(nodes, edges, state, depth)


@router.get("/node/{node_id}")
def get_node(node_id: str):
    """Get a single node's details from the graph definition."""
    node = graph_service.get_node(node_id)
    if node is None:
        raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found")
    return node.model_dump()
