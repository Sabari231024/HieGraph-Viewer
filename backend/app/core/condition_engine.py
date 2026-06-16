from typing import Dict, Any

from app.models.edge import Condition, ConditionalEdge


class ConditionEngine:
    """Evaluates condition expressions against the current merged state."""

    OPERATORS = {
        ">": lambda a, b: a > b,
        "<": lambda a, b: a < b,
        ">=": lambda a, b: a >= b,
        "<=": lambda a, b: a <= b,
        "==": lambda a, b: a == b,
        "!=": lambda a, b: a != b,
    }

    def evaluate(self, condition: Condition, state: Dict[str, Any]) -> bool:
        """Evaluate a single condition against the merged state."""
        field_value = state.get(condition.field)
        if field_value is None:
            return False

        op_func = self.OPERATORS.get(condition.operator)
        if op_func is None:
            return False

        try:
            return op_func(field_value, condition.value)
        except (TypeError, ValueError):
            return False

    def evaluate_edge(self, edge: ConditionalEdge, state: Dict[str, Any]) -> bool:
        """Evaluate a conditional edge's condition against the merged state."""
        return self.evaluate(edge.condition, state)
