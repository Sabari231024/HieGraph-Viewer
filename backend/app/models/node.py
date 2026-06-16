from pydantic import BaseModel, Field
from typing import Dict, Any, Optional


class Node(BaseModel):
    """Represents a graph node with hierarchical level and optional state."""

    id: str
    name: str
    level: int
    state: Dict[str, Any] = Field(default_factory=dict)
    is_exit_node: bool = False
    exit_for: Optional[str] = None  # Which node expansion this exit belongs to
