from pydantic import BaseModel
from typing import Any, Optional


class Condition(BaseModel):
    """A single condition expression: field operator value."""

    field: str
    operator: str  # ">", "<", ">=", "<=", "==", "!="
    value: Any


class Edge(BaseModel):
    """A standard graph edge."""

    source: str
    target: str
    type: str = "NORMAL"  # "NORMAL", "CONDITION", "EXIT", "INTRA"
    label: Optional[str] = None


class ConditionalEdge(BaseModel):
    """An edge with a condition that must be satisfied for traversal."""

    source: str
    target: str
    type: str = "CONDITION"
    condition: Condition
