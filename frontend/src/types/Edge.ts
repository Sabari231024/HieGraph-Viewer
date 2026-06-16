export interface GraphEdge {
  source: string;
  target: string;
  type: 'NORMAL' | 'CONDITION' | 'EXIT';
}

export interface Condition {
  field: string;
  operator: string;
  value: unknown;
}

export interface ConditionalEdge extends GraphEdge {
  type: 'CONDITION';
  condition: Condition;
}
