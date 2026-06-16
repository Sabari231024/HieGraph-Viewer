import uuid
from typing import Dict, List, Tuple, Any

from app.models.node import Node
from app.models.edge import Edge, ConditionalEdge
from app.models.traversal_frame import TraversalFrame
from app.core.graph_service import GraphService
from app.core.state_manager import StateManager
from app.core.condition_engine import ConditionEngine
from app.core.exit_node_manager import ExitNodeManager


class TraversalEngine:
    """
    Orchestrates graph traversal: expansion, collapse, state management,
    condition evaluation, and exit node lifecycle.

    One instance per session.
    """

    def __init__(self, graph_service: GraphService) -> None:
        self.graph_service = graph_service
        self.state_manager = StateManager()
        self.condition_engine = ConditionEngine()
        self.exit_node_manager = ExitNodeManager()

        self.traversal_stack: List[TraversalFrame] = []
        self.visible_nodes: Dict[str, Node] = {}
        self.visible_edges: List[Edge] = []
        self._node_ref_count: Dict[str, int] = {}

        # Level-navigation state
        self.nav_stack: List[str] = []  # Stack of entered node IDs
        self.current_level: int = 1

    # ------------------------------------------------------------------ #
    #  Initialization
    # ------------------------------------------------------------------ #

    def initialize(self) -> Tuple[List[Node], List[Edge]]:
        """Reset everything and return Level 1 nodes."""
        self.traversal_stack.clear()
        self.state_manager.clear()
        self.exit_node_manager.clear()
        self.visible_nodes.clear()
        self.visible_edges.clear()
        self._node_ref_count.clear()

        level1 = self.graph_service.get_nodes_by_level(1)
        for node in level1:
            self.visible_nodes[node.id] = node
            self._node_ref_count[node.id] = 1

        return level1, []

    # ------------------------------------------------------------------ #
    #  Expansion
    # ------------------------------------------------------------------ #

    def expand_node(
        self, node_id: str
    ) -> Dict[str, Any]:
        """
        Expand a node: reveal children, evaluate conditions, create exit node.
        Returns a dict with new_nodes, new_edges, conditional_edges,
        exit_node, and merged_state.
        """
        source_node = self.graph_service.get_node(node_id)
        if source_node is None:
            raise ValueError(f"Node '{node_id}' not found in graph")

        # Check if already expanded
        existing_exit = self.exit_node_manager.get_exit_for_expansion(node_id)
        if existing_exit is not None:
            raise ValueError(f"Node '{node_id}' is already expanded")

        # 1. Push state contributed by this node
        if source_node.state:
            self.state_manager.push(node_id, source_node.state)

        merged_state = self.state_manager.merge()

        # 2. Get normal children and edges
        children = self.graph_service.get_children(node_id)
        normal_edges = self.graph_service.get_outgoing_edges(node_id)

        # 3. Evaluate conditional edges
        cond_edges = self.graph_service.get_outgoing_conditional_edges(node_id)
        satisfied_conditions: List[ConditionalEdge] = []
        conditional_targets: List[Node] = []

        existing_child_ids = {c.id for c in children}
        for ce in cond_edges:
            if self.condition_engine.evaluate_edge(ce, merged_state):
                satisfied_conditions.append(ce)
                target = self.graph_service.get_node(ce.target)
                if target and target.id not in existing_child_ids:
                    conditional_targets.append(target)
                    existing_child_ids.add(target.id)

        # 4. Create virtual exit node
        exit_node = self.exit_node_manager.create_exit_node(source_node)

        # 5. Register new visible nodes (handle shared nodes via ref count)
        new_nodes: List[Node] = []
        revealed_node_ids: List[str] = []

        for child in children + conditional_targets:
            revealed_node_ids.append(child.id)
            if child.id not in self.visible_nodes:
                self.visible_nodes[child.id] = child
                new_nodes.append(child)
                self._node_ref_count[child.id] = 1
            else:
                self._node_ref_count[child.id] = (
                    self._node_ref_count.get(child.id, 0) + 1
                )

        # Add exit node
        self.visible_nodes[exit_node.id] = exit_node
        new_nodes.append(exit_node)
        revealed_node_ids.append(exit_node.id)
        self._node_ref_count[exit_node.id] = 1

        # 6. Register edges
        for edge in normal_edges:
            self.visible_edges.append(edge)

        exit_edge = Edge(source=node_id, target=exit_node.id, type="EXIT")
        self.visible_edges.append(exit_edge)

        # 7. Build traversal frame
        frame = TraversalFrame(
            id=uuid.uuid4().hex,
            expanded_node_id=node_id,
            revealed_node_ids=revealed_node_ids,
            exit_node_id=exit_node.id,
            frame_type="normal",
        )
        self.traversal_stack.append(frame)

        return {
            "new_nodes": new_nodes,
            "new_edges": normal_edges + [exit_edge],
            "conditional_edges": satisfied_conditions,
            "exit_node": exit_node,
            "state": merged_state,
            "traversal_depth": len(self.traversal_stack),
        }

    # ------------------------------------------------------------------ #
    #  Collapse
    # ------------------------------------------------------------------ #

    def collapse_node(self, exit_node_id: str) -> Dict[str, Any]:
        """
        Collapse a branch via its exit node: remove revealed nodes,
        pop state, restore previous context.
        """
        exit_node = self.exit_node_manager.get_exit_node(exit_node_id)
        if exit_node is None:
            raise ValueError(f"Exit node '{exit_node_id}' not found")

        # Find matching traversal frame
        frame = None
        frame_idx = None
        for i, f in enumerate(self.traversal_stack):
            if f.exit_node_id == exit_node_id:
                frame = f
                frame_idx = i
                break

        if frame is None or frame_idx is None:
            raise ValueError(f"No traversal frame for exit node '{exit_node_id}'")

        # Collect child frames that must be collapsed first (deeper expansions)
        child_frames = [
            f for f in self.traversal_stack
            if f.expanded_node_id in frame.revealed_node_ids
               and f.exit_node_id != exit_node_id
        ]

        # Recursively collapse children first (deepest first)
        for cf in reversed(child_frames):
            self.collapse_node(cf.exit_node_id)

        # Re-find frame index after recursive collapses may have shifted it
        frame_idx = None
        for i, f in enumerate(self.traversal_stack):
            if f.exit_node_id == exit_node_id:
                frame_idx = i
                break

        if frame_idx is None:
            raise ValueError("Frame lost during recursive collapse")

        # Pop state for the expanded node
        self.state_manager.pop(frame.expanded_node_id)

        # Remove nodes (only if ref count drops to 0)
        removed_node_ids: List[str] = []
        for nid in frame.revealed_node_ids:
            self._node_ref_count[nid] = self._node_ref_count.get(nid, 1) - 1
            if self._node_ref_count[nid] <= 0:
                self.visible_nodes.pop(nid, None)
                removed_node_ids.append(nid)
                del self._node_ref_count[nid]

        # Remove edges originating from the expanded node
        expanded_id = frame.expanded_node_id
        self.visible_edges = [
            e for e in self.visible_edges if e.source != expanded_id
        ]

        # Clean up exit node
        self.exit_node_manager.remove_exit_node(exit_node_id)

        # Remove frame
        self.traversal_stack.pop(frame_idx)

        merged_state = self.state_manager.merge()

        return {
            "removed_node_ids": removed_node_ids,
            "state": merged_state,
            "traversal_depth": len(self.traversal_stack),
        }

    # ------------------------------------------------------------------ #
    #  View Queries
    # ------------------------------------------------------------------ #

    def get_visible_view(self) -> Tuple[List[Node], List[Edge]]:
        return list(self.visible_nodes.values()), list(self.visible_edges)

    def get_traversal_stack(self) -> List[TraversalFrame]:
        return list(self.traversal_stack)

    def get_merged_state(self) -> Dict[str, Any]:
        return self.state_manager.merge()

    def get_state_stack(self) -> list:
        return self.state_manager.get_stack()

    # ------------------------------------------------------------------ #
    #  Level Navigation (drill-down / drill-up)
    # ------------------------------------------------------------------ #

    def _build_nav_info(self) -> list:
        """Build navigation stack info for API response."""
        info = []
        for nid in self.nav_stack:
            n = self.graph_service.get_node(nid)
            info.append({
                "id": nid,
                "name": n.name if n else nid,
                "level": n.level if n else 0,
                "state": n.state if n else {},
            })
        return info

    def _build_level_view(self, nodes: List[Node]) -> Dict[str, Any]:
        """Build a complete level-view response for a set of nodes."""
        node_ids = {n.id for n in nodes}
        merged = self.state_manager.merge()

        # Within-level normal edges
        edges = self.graph_service.get_edges_between(node_ids)

        # Within-level conditional edges (evaluate against state)
        cond_edges_within = self.graph_service.get_conditional_edges_between(node_ids)
        satisfied_within = [
            ce for ce in cond_edges_within
            if self.condition_engine.evaluate_edge(ce, merged)
        ]

        # Conditional jump edges (to nodes outside this level)
        all_cond = []
        for n in nodes:
            for ce in self.graph_service.get_outgoing_conditional_edges(n.id):
                if ce.target not in node_ids:
                    if self.condition_engine.evaluate_edge(ce, merged):
                        target = self.graph_service.get_node(ce.target)
                        all_cond.append({
                            **ce.model_dump(),
                            "target_name": target.name if target else ce.target,
                            "target_level": target.level if target else 0,
                        })

        return {
            "nodes": [n.model_dump() for n in nodes],
            "edges": [e.model_dump() for e in edges],
            "conditional_edges": [ce.model_dump() for ce in satisfied_within],
            "jump_edges": all_cond,
            "state": merged,
            "state_stack": [f.model_dump() for f in self.state_manager.get_stack()],
            "nav_stack": self._build_nav_info(),
            "current_level": self.current_level,
        }

    def get_initial_level_view(self) -> Dict[str, Any]:
        """Reset and return Level 1 view."""
        self.nav_stack.clear()
        self.state_manager.clear()
        self.current_level = 1

        nodes = self.graph_service.get_nodes_by_level(1)
        return self._build_level_view(nodes)

    def enter_node(self, node_id: str) -> Dict[str, Any]:
        """
        Navigate into a node: push it onto the stack,
        accumulate its state, show its children as a level view.
        Raises ValueError if node has no children (leaf node).
        """
        node = self.graph_service.get_node(node_id)
        if node is None:
            raise ValueError(f"Node '{node_id}' not found")

        children = self.graph_service.get_children(node_id)
        if not children:
            raise ValueError(f"Node '{node.name}' has no sub-levels to explore")

        self.nav_stack.append(node_id)

        if node.state:
            self.state_manager.push(node_id, node.state)

        self.current_level = node.level + 1

        return self._build_level_view(children)

    def go_back(self) -> Dict[str, Any]:
        """Pop the navigation stack and return the previous level view."""
        if not self.nav_stack:
            return self.get_initial_level_view()

        popped_id = self.nav_stack.pop()
        self.state_manager.pop(popped_id)

        if not self.nav_stack:
            return self.get_initial_level_view()

        # Rebuild view for current top of stack
        parent_id = self.nav_stack[-1]
        parent = self.graph_service.get_node(parent_id)
        children = self.graph_service.get_children(parent_id)
        self.current_level = parent.level + 1 if parent else 1

        return self._build_level_view(children)

    def get_full_graph(self) -> Dict[str, Any]:
        """Return ALL nodes and edges for full-graph visualization."""
        all_nodes = list(self.graph_service.nodes.values())
        all_edges = list(self.graph_service.edges)
        all_cond = list(self.graph_service.conditional_edges)
        merged = self.state_manager.merge()

        return {
            "nodes": [n.model_dump() for n in all_nodes],
            "edges": [e.model_dump() for e in all_edges],
            "conditional_edges": [ce.model_dump() for ce in all_cond],
            "jump_edges": [],
            "state": merged,
            "state_stack": [],
            "nav_stack": self._build_nav_info(),
            "current_level": 0,
        }

    def conditional_jump(self, source_id: str, target_id: str) -> Dict[str, Any]:
        """
        Perform a conditional jump: enter the target node
        (which may be at a different level).
        """
        target = self.graph_service.get_node(target_id)
        if target is None:
            raise ValueError(f"Target node '{target_id}' not found")

        # Push the source node if it's not already on stack
        source = self.graph_service.get_node(source_id)
        if source and source_id not in self.nav_stack:
            self.nav_stack.append(source_id)
            if source.state:
                self.state_manager.push(source_id, source.state)

        return self.enter_node(target_id)
