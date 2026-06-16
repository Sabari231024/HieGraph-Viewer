from typing import List, Dict, Any

from app.models.node import Node
from app.models.edge import Edge, ConditionalEdge


class ViewBuilder:
    """Builds structured API response payloads from engine outputs."""

    @staticmethod
    def build_init_view(
        session_id: str, nodes: List[Node], edges: List[Edge]
    ) -> Dict[str, Any]:
        return {
            "session_id": session_id,
            "nodes": [n.model_dump() for n in nodes],
            "edges": [e.model_dump() for e in edges],
            "state": {},
            "traversal_depth": 0,
        }

    @staticmethod
    def build_expand_view(expand_result: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "new_nodes": [n.model_dump() for n in expand_result["new_nodes"]],
            "new_edges": [e.model_dump() for e in expand_result["new_edges"]],
            "conditional_edges": [
                ce.model_dump() for ce in expand_result["conditional_edges"]
            ],
            "exit_node": expand_result["exit_node"].model_dump(),
            "state": expand_result["state"],
            "traversal_depth": expand_result["traversal_depth"],
        }

    @staticmethod
    def build_collapse_view(collapse_result: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "removed_node_ids": collapse_result["removed_node_ids"],
            "state": collapse_result["state"],
            "traversal_depth": collapse_result["traversal_depth"],
        }

    @staticmethod
    def build_full_view(
        nodes: List[Node],
        edges: List[Edge],
        state: Dict[str, Any],
        depth: int,
    ) -> Dict[str, Any]:
        return {
            "nodes": [n.model_dump() for n in nodes],
            "edges": [e.model_dump() for e in edges],
            "state": state,
            "traversal_depth": depth,
        }
