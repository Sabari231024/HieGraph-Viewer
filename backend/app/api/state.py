from fastapi import APIRouter, HTTPException, Query

from app.core.dependencies import session_store

router = APIRouter(prefix="/api/state", tags=["state"])


@router.get("/merged")
def get_merged_state(session_id: str = Query(...)):
    """Return the current merged state (all frames combined)."""
    if session_id not in session_store:
        raise HTTPException(status_code=404, detail="Session not found")

    engine = session_store[session_id]
    return {"merged_state": engine.get_merged_state()}


@router.get("/stack")
def get_state_stack(session_id: str = Query(...)):
    """Return the raw state stack (individual frames)."""
    if session_id not in session_store:
        raise HTTPException(status_code=404, detail="Session not found")

    engine = session_store[session_id]
    stack = engine.get_state_stack()
    return {
        "state_stack": [f.model_dump() for f in stack],
        "merged_state": engine.get_merged_state(),
    }
