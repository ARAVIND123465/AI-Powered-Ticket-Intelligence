import type { Ticket } from '@/types';

const STORAGE_KEY = 'helpdesk_tickets';

const DEFAULT_TICKETS: Ticket[] = [
  { id: 'TKT-1042', title: 'VPN connection drops every 30 minutes', description: 'The VPN client disconnects automatically...', user_id: 'john@company.com', status: 'Open', category: 'Network', priority: 'High', sentiment: 'Frustrated', is_duplicate: false, escalate_recommended: true, ai_root_cause: null, ai_suggested_resolution: null, attachment: null, created_at: new Date(Date.now() - 1800000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'TKT-1041', title: 'Cannot process refund for order #8834', description: 'Customer requesting refund...', user_id: 'aravind@gmail.com', status: 'In_Progress', category: 'Payment', priority: 'Critical', sentiment: 'Negative', is_duplicate: false, escalate_recommended: false, ai_root_cause: null, ai_suggested_resolution: null, attachment: 'receipt_error.pdf', created_at: new Date(Date.now() - 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'TKT-1040', title: 'SSO login returning 403 forbidden', description: 'Active Directory federation...', user_id: 'john@company.com', status: 'Open', category: 'Security', priority: 'High', sentiment: 'Neutral', is_duplicate: true, escalate_recommended: false, ai_root_cause: null, ai_suggested_resolution: null, attachment: null, created_at: new Date(Date.now() - 7200000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'TKT-1039', title: 'Dashboard charts not loading on Safari', description: 'Charts component fails...', user_id: 'emily@company.com', status: 'Resolved', category: 'Bug', priority: 'Medium', sentiment: 'Neutral', is_duplicate: false, escalate_recommended: false, ai_root_cause: null, ai_suggested_resolution: null, attachment: 'safari_console.log', created_at: new Date(Date.now() - 10800000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'TKT-1038', title: 'Request for dark mode in mobile app', description: 'Feature request from multiple users...', user_id: 'john@company.com', status: 'Closed', category: 'Feature Request', priority: 'Low', sentiment: 'Positive', is_duplicate: false, escalate_recommended: false, ai_root_cause: null, ai_suggested_resolution: null, attachment: null, created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date().toISOString() },
];

export const ticketStore = {
  getTickets(): Ticket[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TICKETS));
      return DEFAULT_TICKETS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_TICKETS;
    }
  },

  addTicket(title: string, description: string, category: string, priority: string, sentiment: string, isFake = false, attachmentName: string | null = null): Ticket {
    const tickets = this.getTickets();
    const nextId = `TKT-${1000 + tickets.length + 1}`;
    
    const newTicket: Ticket = {
      id: nextId,
      title,
      description,
      user_id: localStorage.getItem('mock_registered_email') || 'user@company.com',
      status: 'Open',
      category: isFake ? 'Spam' : category,
      priority: isFake ? 'Low' : priority,
      sentiment: isFake ? 'Neutral' : sentiment,
      is_duplicate: false,
      escalate_recommended: category === 'Payment' && !isFake,
      ai_root_cause: isFake ? 'Identified as unwanted/fake/spam attachment data.' : 'Dynamic ML pattern matching.',
      ai_suggested_resolution: isFake ? 'None required. Blocked spam account.' : 'AI suggested step-by-step resolution steps.',
      attachment: attachmentName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    tickets.unshift(newTicket);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    return newTicket;
  },
};
