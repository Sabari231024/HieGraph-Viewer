import type { ConditionalEdge, Condition } from '../types/Edge';

/**
 * Client-side condition evaluation (mirrors backend logic for UI hints).
 */
export function evaluateCondition(
  condition: Condition,
  state: Record<string, unknown>
): boolean {
  const val = state[condition.field];
  if (val === undefined || val === null) return false;

  const ops: Record<string, (a: any, b: any) => boolean> = {
    '>': (a, b) => a > b,
    '<': (a, b) => a < b,
    '>=': (a, b) => a >= b,
    '<=': (a, b) => a <= b,
    '==': (a, b) => a === b,
    '!=': (a, b) => a !== b,
  };

  const fn = ops[condition.operator];
  if (!fn) return false;

  try {
    return fn(val, condition.value);
  } catch {
    return false;
  }
}

export function evaluateEdge(
  edge: ConditionalEdge,
  state: Record<string, unknown>
): boolean {
  return evaluateCondition(edge.condition, state);
}
