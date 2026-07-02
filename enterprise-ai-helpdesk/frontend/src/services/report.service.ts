import api from './api';
import type { ReportRequest, ReportResponse } from '@/types';

export const reportService = {
  async generate(data: ReportRequest): Promise<ReportResponse> {
    const res = await api.post<ReportResponse>('/reports/generate', data);
    return res.data;
  },
};
