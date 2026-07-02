import api from './api';
import type { User } from '@/types';

export const userService = {
  async getMe(): Promise<User> {
    const res = await api.get<User>('/users/me');
    return res.data;
  },

  async getAll(): Promise<User[]> {
    const res = await api.get<User[]>('/users');
    return res.data;
  },
};
