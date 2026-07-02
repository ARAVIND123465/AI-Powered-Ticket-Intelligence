import api from './api';
import type { Notification } from '@/types';

export const notificationService = {
  async getUnread(): Promise<Notification[]> {
    const res = await api.get<Notification[]>('/notifications');
    return res.data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },
};
