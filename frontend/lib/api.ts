import { CreateEntryPayload, Entry, Stats, User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ── Token storage ──────────────────────────────────────────────
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('coachdash_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('coachdash_token', token);
};

export const clearToken = (): void => {
  localStorage.removeItem('coachdash_token');
  localStorage.removeItem('coachdash_user');
};

// ── Base fetch helper ─────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register: (email: string, name: string, password: string) =>
    apiFetch<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    }),

  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => apiFetch<User>('/api/auth/me'),
};

// ── Entries ───────────────────────────────────────────────────
export const entriesAPI = {
  list: (params?: { skill?: string; from?: string; to?: string }) => {
    const filtered = params
      ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
      : {};
    const qs = Object.keys(filtered).length
      ? '?' + new URLSearchParams(filtered as Record<string, string>).toString()
      : '';
    return apiFetch<Entry[]>(`/api/entries${qs}`);
  },

  getById: (id: number) => apiFetch<Entry>(`/api/entries/${id}`),

  create: (payload: CreateEntryPayload) =>
    apiFetch<Entry>('/api/entries', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  delete: (id: number) =>
    apiFetch<{ message: string }>(`/api/entries/${id}`, { method: 'DELETE' }),

  stats: () => apiFetch<Stats>('/api/entries/stats'),
};

// ── AI Summary (SSE streaming) ────────────────────────────────
export const streamAISummary = async (
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> => {
  const token = getToken();

  const res = await fetch(`${API_URL}/api/ai/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Failed to connect' }));
    onError(body.error);
    return;
  }

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) { onError('No stream'); return; }

  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') { onDone(); return; }
      try {
        const parsed = JSON.parse(data);
        if (parsed.text) onChunk(parsed.text);
        if (parsed.error) onError(parsed.error);
      } catch {
        // skip malformed chunks
      }
    }
  }
  onDone();
};
