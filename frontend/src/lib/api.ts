import { z } from 'zod';

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty'),
});

export type SearchFormValues = z.infer<typeof searchSchema>;

export interface SearchResult {
  title: string;
  url: string;
}

export interface SearchHistoryItem {
  id: number;
  query: string;
  createdAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function executeSearch(query: string, save = false): Promise<{ results: SearchResult[], total: number }> {
  const endpoint = save ? `${API_BASE}/search` : `${API_BASE}/search?q=${encodeURIComponent(query)}`;

  const res = await fetch(endpoint, {
    method: save ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: save ? JSON.stringify({ query }) : undefined,
  });

  if (!res.ok) throw new Error('Search request failed');
  return res.json();
}

export async function getSearchHistory(): Promise<SearchHistoryItem[]> {
  try {
    const res = await fetch(`${API_BASE}/search/history`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.history || [];
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return [];
  }
}