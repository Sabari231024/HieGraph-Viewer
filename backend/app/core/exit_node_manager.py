import uuid
from typing import Dict, Optional

from app.models.node import Node


class ExitNodeManager:
    """
    Manages virtual exit nodes that are generated at runtime.
    Each expansion creates a corresponding EXIT node for backtracking.
    """

    def __init__(self) -> None:
        self.exit_nodes: Dict[str, Node] = {}  # exit_node_id -> Node
        self._expansion_map: Dict[str, str] = {}  # expanded_node_id -> exit_node_id

    def create_exit_node(self, expanded_node: Node) -> Node:
        """Create a virtual exit node for an expanded node."""
        exit_id = f"EXIT_{expanded_node.id}_{uuid.uuid4().hex[:8]}"
        exit_node = Node(
            id=exit_id,
            name=f"EXIT({expanded_node.name})",
            level=expanded_node.level,
            state={},
            is_exit_node=True,
            exit_for=expanded_node.id,
        )
        self.exit_nodes[exit_id] = exit_node
        self._expansion_map[expanded_node.id] = exit_id
        return exit_node

    def get_exit_node(self, exit_node_id: str) -> Optional[Node]:
        return self.exit_nodes.get(exit_node_id)

    def remove_exit_node(self, exit_node_id: str) -> None:
        node = self.exit_nodes.pop(exit_node_id, None)
        if node and node.exit_for:
            self._expansion_map.pop(node.exit_for, None)

    def is_exit_node(self, node_id: str) -> bool:
        return node_id in self.exit_nodes

    def get_exit_for_expansion(self, expanded_node_id: str) -> Optional[str]:
        return self._expansion_map.get(expanded_node_id)

    def clear(self) -> None:
        self.exit_nodes.clear()
        self._expansion_map.clear()
