import Badge from '@/components/ui/Badge';
import { formatRelative, truncate } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import type { Ticket } from '@/types';

interface TicketCardProps {
  ticket: Ticket;
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/tickets/${ticket.id}`)}
      className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 hover:border-[var(--border-accent)] hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono text-[var(--text-tertiary)]">{ticket.id}</span>
            {ticket.priority && <Badge variant="priority" size="sm">{ticket.priority}</Badge>}
            <Badge variant="status" size="sm">{ticket.status}</Badge>
          </div>
          <h4 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-primary-400 transition-colors truncate">
            {ticket.title}
          </h4>
          <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">{truncate(ticket.description, 120)}</p>
          <div className="flex items-center gap-2 mt-2">
            {ticket.category && <Badge variant="default" size="sm">{ticket.category}</Badge>}
            {ticket.sentiment && <Badge variant="sentiment" size="sm">{ticket.sentiment}</Badge>}
            {ticket.is_duplicate && <Badge variant="warning" size="sm">Duplicate</Badge>}
            <span className="text-[10px] text-[var(--text-tertiary)] ml-auto">{formatRelative(ticket.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
