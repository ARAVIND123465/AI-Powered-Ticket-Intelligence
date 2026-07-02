import api from './api';
import type { PredictiveAnalysis, SentimentTrend } from '@/types';

export const analyticsService = {
  async getPredictions(): Promise<PredictiveAnalysis> {
    const res = await api.get<PredictiveAnalysis>('/analytics/predictions');
    return res.data;
  },

  async getSentimentTrends(): Promise<SentimentTrend[]> {
    const res = await api.get<SentimentTrend[]>('/analytics/sentiment');
    return res.data;
  },
};
