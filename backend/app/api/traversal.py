from fastapi import APIRouter, HTTPException, Query

from app.core.dependencies import session_store, get_or_create_session
from app.core.view_builder import ViewBuilder

router = APIRouter(prefix="/api/traversal", tags=["traversal"])


@router.post("/expand/{node_id}")
def expand_node(node_id: str, session_id: str = Query(...)):
    """
    Expand a node to reveal its children, conditional targets, and exit node.
    Pushes state and creates a traversal frame.
    """
    if session_id not in session_store:
        raise HTTPException(status_code=404, detail="Session not found")

    engine = session_store[session_id]
    try:
        result = engine.expand_node(node_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return ViewBuilder.build_expand_view(result)


@router.post("/collapse/{exit_node_id}")
def collapse_node(exit_node_id: str, session_id: str = Query(...)):
    """
    Collapse a branch by activating its exit node.
    Pops state, removes revealed nodes, restores previous context.
    """
    if session_id not in session_store:
        raise HTTPException(status_code=404, detail="Session not found")

    engine = session_store[session_id]
    try:
        result = engine.collapse_node(exit_node_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return ViewBuilder.build_collapse_view(result)


@router.get("/stack")
def get_traversal_stack(session_id: str = Query(...)):
    """Return the current traversal stack frames."""
    if session_id not in session_store:
        raise HTTPException(status_code=404, detail="Session not found")

    engine = session_store[session_id]
    stack = engine.get_traversal_stack()
    return {"traversal_stack": [f.model_dump() for f in stack]}


# ------------------------------------------------------------------ #
#  Level Navigation Endpoints (drill-down / drill-up)
# ------------------------------------------------------------------ #


@router.get("/level-view")
def get_level_view(session_id: str = Query(default=None)):
    """Initialize and return level 1 view."""
    session_id, engine = get_or_create_session(session_id)
    result = engine.get_initial_level_view()
    result["session_id"] = session_id
    return result


@router.post("/enter/{node_id}")
def enter_node(node_id: str, session_id: str = Query(...)):
    """
    Navigate into a node: show only its children as the new level view.
    Previous level nodes are removed from display.
    """
    if session_id not in session_store:
        raise HTTPException(status_code=404, detail="Session not found")

    engine = session_store[session_id]
    try:
        result = engine.enter_node(node_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return result


@router.post("/back")
def go_back(session_id: str = Query(...)):
    """
    Navigate back to the previous level.
    Current level nodes are removed, parent level nodes are shown.
    """
    if session_id not in session_store:
        raise HTTPException(status_code=404, detail="Session not found")

    engine = session_store[session_id]
    result = engine.go_back()
    return result


@router.get("/full-graph")
def get_full_graph(session_id: str = Query(default=None)):
    """Return ALL nodes and edges for full-graph visualization."""
    session_id, engine = get_or_create_session(session_id)
    result = engine.get_full_graph()
    result["session_id"] = session_id
    return result
