const API_BASE = 'http://localhost:8000/api';

export async function fetchGraphInit(sessionId?: string) {
  const params = sessionId ? `?session_id=${sessionId}` : '';
  const res = await fetch(`${API_BASE}/graph/init${params}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchCurrentView(sessionId: string) {
  const res = await fetch(`${API_BASE}/graph/view?session_id=${sessionId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchNode(nodeId: string) {
  const res = await fetch(`${API_BASE}/graph/node/${nodeId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchLevelView(sessionId?: string) {
  const params = sessionId ? `?session_id=${sessionId}` : '';
  const res = await fetch(`${API_BASE}/traversal/level-view${params}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchFullGraph(sessionId?: string) {
  const params = sessionId ? `?session_id=${sessionId}` : '';
  const res = await fetch(`${API_BASE}/traversal/full-graph${params}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
