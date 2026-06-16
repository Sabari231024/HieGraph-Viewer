from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class StateFrameSchema(BaseModel):
    node_id: str
    data: Dict[str, Any]


class TraversalFrameSchema(BaseModel):
    id: str
    expanded_node_id: str
    revealed_node_ids: List[str]
    exit_node_id: str
    frame_type: str


class TraversalStateResponse(BaseModel):
    """Response for full traversal and state info."""

    state_stack: List[StateFrameSchema]
    merged_state: Dict[str, Any]
    traversal_stack: List[TraversalFrameSchema]
    traversal_depth: int


class CollapseResponse(BaseModel):
    """Response for branch collapse."""

    removed_node_ids: List[str]
    state: Dict[str, Any]
    traversal_depth: int


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


class FullViewResponse(BaseModel):
    """Full current view of the graph."""

    nodes: List[NodeSchema]
    edges: List[EdgeSchema]
    state: Dict[str, Any]
    traversal_depth: int
