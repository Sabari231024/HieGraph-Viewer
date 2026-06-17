export interface GraphEdge {
  source: string;
  target: string;
  type: 'NORMAL' | 'CONDITION' | 'EXIT' | 'INTRA';
  label?: string;
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
