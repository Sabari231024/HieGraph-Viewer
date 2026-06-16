const API_BASE = 'http://localhost:8000/api';

export async function expandNode(nodeId: string, sessionId: string) {
  const res = await fetch(
    `${API_BASE}/traversal/expand/${nodeId}?session_id=${sessionId}`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function collapseNode(exitNodeId: string, sessionId: string) {
  const res = await fetch(
    `${API_BASE}/traversal/collapse/${exitNodeId}?session_id=${sessionId}`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchTraversalStack(sessionId: string) {
  const res = await fetch(`${API_BASE}/traversal/stack?session_id=${sessionId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function enterNode(nodeId: string, sessionId: string) {
  const res = await fetch(
    `${API_BASE}/traversal/enter/${nodeId}?session_id=${sessionId}`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function goBack(sessionId: string) {
  const res = await fetch(
    `${API_BASE}/traversal/back?session_id=${sessionId}`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
