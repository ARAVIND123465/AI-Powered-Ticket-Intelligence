import api from './api';
import type { SearchResult } from '@/types';

export const searchService = {
  async search(query: string, limit = 5, source?: string): Promise<SearchResult[]> {
    const params: Record<string, string | number> = { q: query, limit };
    if (source) params.source = source;
    const res = await api.get<SearchResult[]>('/search', { params });
    return res.data;
  },
};
