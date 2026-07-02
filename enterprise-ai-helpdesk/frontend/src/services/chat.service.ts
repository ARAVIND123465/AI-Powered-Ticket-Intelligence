import api from './api';
import type { ChatQuery, ChatResponse } from '@/types';

export const chatService = {
  async ask(data: ChatQuery): Promise<ChatResponse> {
    const res = await api.post<ChatResponse>('/chatbot/ask', data);
    return res.data;
  },
};
