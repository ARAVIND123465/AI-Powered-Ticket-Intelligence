import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Filter } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/utils/cn';
import type { Ticket } from '@/types';
import { ticketStore } from '@/utils/ticketStore';

const TABS = ['All', 'Open', 'In_Progress', 'Resolved', 'Closed'] as const;

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    setTickets(ticketStore.getTickets());
  }, []);

  const filtered = tickets.filter((t) => {
    if (activeTab !== 'All' && t.status !== activeTab) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Tickets</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">{tickets.length} tickets total</p>
        </div>
        <Button onClick={() => navigate('/tickets/create')} size="sm"><Plus className="w-4 h-4" /> New Ticket</Button>
      </motion.div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 bg-[var(--bg-tertiary)] rounded-xl p-1">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', activeTab === tab ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]')}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
        <input
          type="text" placeholder="Search tickets…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 h-9 px-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500"
        />
      </div>

      {/* Ticket List */}
      {filtered.length === 0 ? (
        <EmptyState title="No tickets found" description="Try adjusting your filters or create a new ticket" action={{ label: 'Create Ticket', onClick: () => navigate('/tickets/create') }} />
      ) : (
        <div className="space-y-2">
          {filtered.map((ticket, i) => (
            <motion.div key={ticket.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 hover:border-[var(--border-accent)] hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[var(--text-tertiary)]">{ticket.id}</span>
                    <Badge variant="priority" size="sm">{ticket.priority}</Badge>
                    <Badge variant="status" size="sm">{ticket.status}</Badge>
                    {ticket.is_duplicate && <Badge variant="warning" size="sm">Duplicate</Badge>}
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-primary-400 transition-colors">{ticket.title}</h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="default" size="sm">{ticket.category}</Badge>
                    {ticket.sentiment && <Badge variant="sentiment" size="sm">{ticket.sentiment}</Badge>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
