import api from './api';
import type { Ticket, TicketCreate, TicketUpdate } from '@/types';

export const ticketService = {
  async create(data: TicketCreate): Promise<Ticket> {
    const res = await api.post<Ticket>('/tickets', data);
    return res.data;
  },

  async getById(id: string): Promise<Ticket> {
    const res = await api.get<Ticket>(`/tickets/${id}`);
    return res.data;
  },

  async getAll(): Promise<Ticket[]> {
    const res = await api.get<Ticket[]>('/tickets');
    return res.data;
  },

  async update(id: string, data: TicketUpdate): Promise<Ticket> {
    const res = await api.patch<Ticket>(`/tickets/${id}`, data);
    return res.data;
  },

  async reclassify(id: string) {
    const res = await api.post(`/tickets/${id}/reclassify`);
    return res.data;
  },
};
