import { motion } from 'framer-motion';
import Badge from '@/components/ui/Badge';
import { formatRelative } from '@/utils/formatters';
import { cn } from '@/utils/cn';

const DEMO_TICKETS = [
  { id: 'TKT-1042', title: 'VPN connection drops every 30 minutes', category: 'Network', priority: 'High', status: 'Open', sentiment: 'Frustrated', created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 'TKT-1041', title: 'Cannot process refund for order #8834', category: 'Payment', priority: 'Critical', status: 'In_Progress', sentiment: 'Negative', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'TKT-1040', title: 'SSO login returning 403 forbidden', category: 'Security', priority: 'High', status: 'Open', sentiment: 'Neutral', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 'TKT-1039', title: 'Dashboard charts not loading on Safari', category: 'Bug', priority: 'Medium', status: 'Open', sentiment: 'Neutral', created_at: new Date(Date.now() - 10800000).toISOString() },
  { id: 'TKT-1038', title: 'Request for dark mode in mobile app', category: 'Feature Request', priority: 'Low', status: 'Open', sentiment: 'Positive', created_at: new Date(Date.now() - 14400000).toISOString() },
];

export default function RecentTickets() {
  return (
    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border-primary)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent Tickets</h3>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Latest support tickets with AI classifications</p>
      </div>
      <div className="divide-y divide-[var(--border-primary)]">
        {DEMO_TICKETS.map((ticket, i) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="px-5 py-3 hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-[var(--text-tertiary)]">{ticket.id}</span>
                  <Badge variant="priority" size="sm">{ticket.priority}</Badge>
                  <Badge variant="status" size="sm">{ticket.status}</Badge>
                </div>
                <p className="text-sm text-[var(--text-primary)] font-medium truncate group-hover:text-primary-400 transition-colors">
                  {ticket.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="default" size="sm">{ticket.category}</Badge>
                  <Badge variant="sentiment" size="sm">{ticket.sentiment}</Badge>
                  <span className="text-[10px] text-[var(--text-tertiary)]">{formatRelative(ticket.created_at)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
