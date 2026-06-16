from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class NodeSchema(BaseModel):
    id: str
    name: str
    level: int
    state: Dict[str, Any] = {}
    is_exit_node: bool = False
    exit_for: Optional[str] = None


class EdgeSchema(BaseModel):
    source: str
    target: str
    type: str


class GraphInitResponse(BaseModel):
    """Response for initial graph load."""

    session_id: str
    nodes: List[NodeSchema]
    edges: List[EdgeSchema]
    state: Dict[str, Any]
    traversal_depth: int
