from pydantic import BaseModel, Field
from typing import Dict, Any


class StateFrame(BaseModel):
    """
    A single frame in the state stack.
    Pushed when entering a node that contributes state; popped on exit.
    """

    node_id: str
    data: Dict[str, Any] = Field(default_factory=dict)
