import type { Ticket } from '@/types';

const STORAGE_KEY = 'helpdesk_tickets';

const DEFAULT_TICKETS: Ticket[] = [
  { id: 'TKT-1042', title: 'VPN connection drops every 30 minutes', description: 'The VPN client disconnects automatically...', user_id: 'john@company.com', status: 'Open', category: 'Network', priority: 'High', sentiment: 'Frustrated', is_duplicate: false, escalate_recommended: true, ai_root_cause: null, ai_suggested_resolution: null, attachment: null, created_at: new Date(Date.now() - 1800000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'TKT-1041', title: 'Cannot process refund for order #8834', description: 'Customer requesting refund...', user_id: 'aravind@gmail.com', status: 'In_Progress', category: 'Payment', priority: 'Critical', sentiment: 'Negative', is_duplicate: false, escalate_recommended: false, ai_root_cause: null, ai_suggested_resolution: null, attachment: 'receipt_error.pdf', created_at: new Date(Date.now() - 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'TKT-1040', title: 'SSO login returning 403 forbidden', description: 'Active Directory federation...', user_id: 'john@company.com', status: 'Open', category: 'Security', priority: 'High', sentiment: 'Neutral', is_duplicate: true, escalate_recommended: false, ai_root_cause: null, ai_suggested_resolution: null, attachment: null, created_at: new Date(Date.now() - 7200000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'TKT-1039', title: 'Dashboard charts not loading on Safari', description: 'Charts component fails...', user_id: 'emily@company.com', status: 'Resolved', category: 'Bug', priority: 'Medium', sentiment: 'Neutral', is_duplicate: false, escalate_recommended: false, ai_root_cause: null, ai_suggested_resolution: null, attachment: 'safari_console.log', created_at: new Date(Date.now() - 10800000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'TKT-1038', title: 'Request for dark mode in mobile app', description: 'Feature request from multiple users...', user_id: 'john@company.com', status: 'Closed', category: 'Feature Request', priority: 'Low', sentiment: 'Positive', is_duplicate: false, escalate_recommended: false, ai_root_cause: null, ai_suggested_resolution: null, attachment: null, created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date().toISOString() },
];

export interface TicketAgentResponse {
  id: string;
  agent_name: string;
  response_text: string;
  created_at: string;
  status_changed_to?: string;
}

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

  addTicket(
    title: string,
    description: string,
    category: string,
    priority: string,
    sentiment: string,
    isFake = false,
    attachmentName: string | null = null,
    pdfExtractedText: string | null = null,
    pdfSummary: string | null = null,
    customEmail: string | null = null
  ): Ticket {
    const tickets = this.getTickets();
    const nextId = `TKT-${1000 + tickets.length + 1}`;
    
    const newTicket: Ticket = {
      id: nextId,
      title,
      description,
      user_id: customEmail || localStorage.getItem('mock_registered_email') || 'user@company.com',
      status: 'Open',
      category: isFake ? 'Spam' : category,
      priority: isFake ? 'Low' : priority,
      sentiment: isFake ? 'Neutral' : sentiment,
      is_duplicate: false,
      escalate_recommended: category === 'Payment' && !isFake,
      ai_root_cause: isFake ? 'Identified as unwanted/fake/spam attachment data.' : 'Dynamic ML pattern matching.',
      ai_suggested_resolution: isFake ? 'None required. Blocked spam account.' : 'AI suggested step-by-step resolution steps.',
      attachment: attachmentName,
      pdf_extracted_text: pdfExtractedText,
      pdf_summary: pdfSummary,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      agent_responses: [
        {
          id: `RESP-${Date.now()}`,
          agent_name: 'AI Support Bot',
          response_text: isFake
            ? '⚠️ Document inspection complete: Detected as non-IT ticket upload (e.g. Bus Ticket / Movie Ticket). This request is marked for security review.'
            : '✅ Support ticket received & automatically routed to technical engineering team. Expected resolution time: 2 hours.',
          created_at: new Date().toISOString(),
        }
      ]
    } as any;

    tickets.unshift(newTicket);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    return newTicket;
  },

  addAgentResponse(ticketId: string, agentName: string, responseText: string, newStatus?: string): Ticket | null {
    const tickets = this.getTickets();
    const t = tickets.find((item) => item.id.toLowerCase() === ticketId.toLowerCase() || item.id.endsWith(ticketId));
    if (t) {
      if (!t.agent_responses) t.agent_responses = [];
      t.agent_responses.push({
        id: `RESP-${Date.now()}`,
        agent_name: agentName,
        response_text: responseText,
        created_at: new Date().toISOString(),
        status_changed_to: newStatus,
      });

      if (newStatus) {
        t.status = newStatus as any;
      }
      t.updated_at = new Date().toISOString();

      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
      return t;
    }
    return null;
  },

  findTicketForTracking(ticketId: string, email: string): Ticket | null {
    const tickets = this.getTickets();
    const cleanId = ticketId.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    return tickets.find((t) => {
      const matchId = t.id.toLowerCase() === cleanId || 
                      t.id.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanId.replace(/[^a-z0-9]/g, '') ||
                      t.id.toLowerCase().endsWith(cleanId);
      const matchEmail = !cleanEmail || t.user_id.toLowerCase() === cleanEmail || t.user_id.toLowerCase().includes(cleanEmail);
      return matchId && matchEmail;
    }) || null;
  },
};
