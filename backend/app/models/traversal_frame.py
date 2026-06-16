from pydantic import BaseModel
from typing import List, Optional


class TraversalFrame(BaseModel):
    """
    A single frame in the traversal stack.
    Created when a node is expanded; removed when its exit node is activated.
    """

    id: str
    expanded_node_id: str  # The node that was double-clicked / expanded
    revealed_node_ids: List[str] = []  # Node IDs added by this expansion
    exit_node_id: str  # Virtual exit node ID for this frame
    frame_type: str = "normal"  # "normal" or "conditional"
    conditional_source: Optional[str] = None  # For conditional frames
