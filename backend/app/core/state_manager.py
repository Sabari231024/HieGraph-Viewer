from typing import Dict, Any, List, Optional

from app.models.state_frame import StateFrame


class StateManager:
    """
    Stack-based traversal state manager.
    Each node that contributes state pushes a frame; exiting pops it.
    The merged state is the union of all frames (later frames override).
    """

    def __init__(self) -> None:
        self.stack: List[StateFrame] = []

    def push(self, node_id: str, data: Dict[str, Any]) -> None:
        """Push a new state frame if the node contributes state."""
        if data:
            self.stack.append(StateFrame(node_id=node_id, data=data))

    def pop(self, node_id: str) -> Optional[StateFrame]:
        """Pop the most recent state frame for a given node."""
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i].node_id == node_id:
                return self.stack.pop(i)
        return None

    def merge(self) -> Dict[str, Any]:
        """Merge all frames bottom-to-top; later frames override earlier ones."""
        merged: Dict[str, Any] = {}
        for frame in self.stack:
            merged.update(frame.data)
        return merged

    def get_stack(self) -> List[StateFrame]:
        return list(self.stack)

    def clear(self) -> None:
        self.stack.clear()
