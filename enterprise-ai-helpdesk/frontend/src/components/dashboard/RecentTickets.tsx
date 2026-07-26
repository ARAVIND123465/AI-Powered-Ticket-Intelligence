import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import { formatRelative } from '@/utils/formatters';
import { ticketStore } from '@/utils/ticketStore';
import { useAuth } from '@/context/AuthContext';

export default function RecentTickets() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  
  const allTickets = ticketStore.getTickets();
  const currentUserEmail = user?.email || localStorage.getItem('mock_registered_email') || '';

  // Filter tickets specifically for Customer
  const tickets = (role === 'Customer' && currentUserEmail)
    ? allTickets.filter((t) =>
        t.user_id.toLowerCase() === currentUserEmail.toLowerCase() ||
        t.user_id.toLowerCase().includes(currentUserEmail.toLowerCase())
      )
    : allTickets;

  const displayTickets = tickets.slice(0, 5);

  return (
    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border-primary)] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            {role === 'Customer' ? 'My Submitted Tickets' : 'Recent Tickets'}
          </h3>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            {role === 'Customer' ? 'Live status & support updates on your tickets' : 'Latest support tickets across tenant'}
          </p>
        </div>
        <span className="text-xs text-primary-400 font-mono font-bold">{tickets.length} Total</span>
      </div>

      <div className="divide-y divide-[var(--border-primary)]">
        {displayTickets.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--text-tertiary)]">
            No tickets submitted yet. Click <strong>Create Ticket</strong> to raise a support request.
          </div>
        ) : (
          displayTickets.map((ticket, i) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
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
                    {ticket.sentiment && <Badge variant="sentiment" size="sm">{ticket.sentiment}</Badge>}
                    <span className="text-[10px] text-[var(--text-tertiary)]">{formatRelative(ticket.created_at)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
