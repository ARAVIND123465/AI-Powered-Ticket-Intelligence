import api from './api';
import type { TicketAttachment, PDFAnalysisResult } from '@/types';

export const attachmentService = {
  /**
   * Upload a PDF file and attach it to an existing ticket.
   */
  async upload(ticketId: string, file: File): Promise<TicketAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<TicketAttachment>(`/tickets/${ticketId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  /**
   * Fetch all attachments associated with a ticket.
   */
  async list(ticketId: string): Promise<TicketAttachment[]> {
    const res = await api.get<TicketAttachment[]>(`/tickets/${ticketId}/attachments`);
    return res.data;
  },

  /**
   * Download the PDF as a Blob (supports authenticated in-browser PDF preview).
   */
  async downloadBlob(ticketId: string, attachmentId: string): Promise<Blob> {
    const res = await api.get(`/tickets/${ticketId}/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    });
    return res.data;
  },

  /**
   * Trigger AI-powered analysis on a PDF attachment.
   */
  async analyze(ticketId: string, attachmentId: string): Promise<PDFAnalysisResult> {
    const res = await api.post<PDFAnalysisResult>(
      `/tickets/${ticketId}/attachments/${attachmentId}/analyze`
    );
    return res.data;
  },

  /**
   * Retrieve all saved AI analyses for a specific attachment.
   */
  async getAnalyses(ticketId: string, attachmentId: string): Promise<PDFAnalysisResult[]> {
    const res = await api.get<PDFAnalysisResult[]>(
      `/tickets/${ticketId}/attachments/${attachmentId}/analyses`
    );
    return res.data;
  },
};
