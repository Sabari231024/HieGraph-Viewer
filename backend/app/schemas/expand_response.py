from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class ConditionSchema(BaseModel):
    field: str
    operator: str
    value: Any


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


class ConditionalEdgeSchema(BaseModel):
    source: str
    target: str
    type: str
    condition: ConditionSchema


class ExpandResponse(BaseModel):
    """Response for node expansion."""

    new_nodes: List[NodeSchema]
    new_edges: List[EdgeSchema]
    conditional_edges: List[ConditionalEdgeSchema]
    exit_node: NodeSchema
    state: Dict[str, Any]
    traversal_depth: int
