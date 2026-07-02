import api from './api';
import type { DashboardSummary, WeeklyLoad } from '@/types';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const res = await api.get<DashboardSummary>('/dashboard/summary');
    return res.data;
  },

  async getWeeklyLoad(): Promise<WeeklyLoad[]> {
    const res = await api.get<WeeklyLoad[]>('/dashboard/weekly-load');
    return res.data;
  },
};
