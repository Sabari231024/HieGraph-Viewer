import json
from pathlib import Path
from typing import Dict, List, Tuple

from app.models.node import Node
from app.models.edge import Edge, ConditionalEdge


class GraphLoader:
    """Loads graph definition from a JSON file."""

    def __init__(self, graph_path: str):
        self.graph_path = Path(graph_path)

    def load(self) -> Tuple[Dict[str, Node], List[Edge], List[ConditionalEdge]]:
        """
        Parse graph.json and return indexed nodes, edges, and conditional edges.
        """
        with open(self.graph_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        nodes: Dict[str, Node] = {}
        for raw in data["nodes"]:
            node = Node(**raw)
            nodes[node.id] = node

        edges = [Edge(**e) for e in data["edges"]]
        conditional_edges = [ConditionalEdge(**ce) for ce in data["conditional_edges"]]

        return nodes, edges, conditional_edges
