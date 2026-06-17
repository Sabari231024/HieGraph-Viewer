from typing import Dict, List, Optional

from app.models.node import Node
from app.models.edge import Edge, ConditionalEdge


class GraphService:
    """
    In-memory graph store with indexed lookups.
    Provides the abstraction layer that can be swapped for Neo4j later.
    """

    def __init__(
        self,
        nodes: Dict[str, Node],
        edges: List[Edge],
        conditional_edges: List[ConditionalEdge],
    ):
        self.nodes = nodes
        self.edges = edges
        self.conditional_edges = conditional_edges

        # Indices
        self._children: Dict[str, List[str]] = {}
        self._parents: Dict[str, List[str]] = {}
        self._outgoing_edges: Dict[str, List[Edge]] = {}
        self._outgoing_conditional: Dict[str, List[ConditionalEdge]] = {}
        self._level_nodes: Dict[int, List[str]] = {}

        self._build_indices()

    # ------------------------------------------------------------------ #
    #  Index Construction
    # ------------------------------------------------------------------ #

    def _build_indices(self) -> None:
        # Level index
        for node in self.nodes.values():
            self._level_nodes.setdefault(node.level, []).append(node.id)

        # Normal edge indices
        for edge in self.edges:
            self._children.setdefault(edge.source, []).append(edge.target)
            self._parents.setdefault(edge.target, []).append(edge.source)
            self._outgoing_edges.setdefault(edge.source, []).append(edge)

        # Conditional edge index
        for ce in self.conditional_edges:
            self._outgoing_conditional.setdefault(ce.source, []).append(ce)

    # ------------------------------------------------------------------ #
    #  Query Methods
    # ------------------------------------------------------------------ #

    def get_nodes_by_level(self, level: int) -> List[Node]:
        ids = self._level_nodes.get(level, [])
        return [self.nodes[nid] for nid in ids]

    def get_node(self, node_id: str) -> Optional[Node]:
        return self.nodes.get(node_id)

    def get_children(self, node_id: str) -> List[Node]:
        child_ids = self._children.get(node_id, [])
        return [self.nodes[cid] for cid in child_ids if cid in self.nodes]

    def get_child_ids(self, node_id: str) -> List[str]:
        return list(self._children.get(node_id, []))

    def get_outgoing_edges(self, node_id: str) -> List[Edge]:
        return list(self._outgoing_edges.get(node_id, []))

    def get_outgoing_conditional_edges(self, node_id: str) -> List[ConditionalEdge]:
        return list(self._outgoing_conditional.get(node_id, []))

    def get_parents(self, node_id: str) -> List[Node]:
        parent_ids = self._parents.get(node_id, [])
        return [self.nodes[pid] for pid in parent_ids if pid in self.nodes]

    def get_all_levels(self) -> List[int]:
        return sorted(self._level_nodes.keys())

    def get_edges_between(self, node_ids: set) -> List[Edge]:
        """Get all normal edges where both source and target are in node_ids."""
        result = []
        for nid in node_ids:
            for edge in self._outgoing_edges.get(nid, []):
                if edge.target in node_ids:
                    result.append(edge)
        return result

    def get_conditional_edges_between(self, node_ids: set) -> List[ConditionalEdge]:
        """Get all conditional edges where both source and target are in node_ids."""
        result = []
        for nid in node_ids:
            for ce in self._outgoing_conditional.get(nid, []):
                if ce.target in node_ids:
                    result.append(ce)
        return result

    def get_conditional_edges_from(self, node_ids: set, exclude_targets: set = None) -> List[ConditionalEdge]:
        """Get conditional edges from node_ids to targets OUTSIDE the set (jump edges)."""
        exclude = exclude_targets or set()
        result = []
        for nid in node_ids:
            for ce in self._outgoing_conditional.get(nid, []):
                if ce.target not in node_ids or ce.target in exclude:
                    result.append(ce)
        return result

    def get_parent_ids(self, node_id: str) -> List[str]:
        """Return raw parent IDs (from normal edges only)."""
        return list(self._parents.get(node_id, []))

    def get_path_to_root(self, node_id: str) -> List[str]:
        """Find a path from a Level-1 ancestor down to node_id.

        Returns list of node IDs from root to node_id (inclusive),
        e.g. [L1_X, L2_Y, L3_Z] for a Level-3 node.
        Uses BFS upward through parents, preferring the shortest path.
        """
        node = self.get_node(node_id)
        if node is None:
            return []
        if node.level == 1:
            return [node_id]

        # BFS upward from node_id
        from collections import deque
        queue: deque = deque()
        queue.append([node_id])
        visited = {node_id}

        while queue:
            path = queue.popleft()
            current = path[-1]
            current_node = self.get_node(current)
            if current_node and current_node.level == 1:
                # Found root — reverse to get root-first order
                return list(reversed(path))

            for pid in self.get_parent_ids(current):
                if pid not in visited:
                    visited.add(pid)
                    queue.append(path + [pid])

        return []  # No path found (shouldn't happen in a connected graph)

