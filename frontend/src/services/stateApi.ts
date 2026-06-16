const API_BASE = 'http://localhost:8000/api';

export async function fetchMergedState(sessionId: string) {
  const res = await fetch(`${API_BASE}/state/merged?session_id=${sessionId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchStateStack(sessionId: string) {
  const res = await fetch(`${API_BASE}/state/stack?session_id=${sessionId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
