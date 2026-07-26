import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Ticket, Search, Bot, Bell, ChevronRight, Clock,
  CheckCircle2, AlertCircle, Sparkles, MessageSquare, TrendingUp,
  RefreshCw, ArrowRight,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { ticketStore } from '@/utils/ticketStore';
import type { Ticket as TicketType } from '@/types';
import { cn } from '@/utils/cn';

const STATUS_META: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  Open: { color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: AlertCircle },
  In_Progress: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: RefreshCw },
  Resolved: { color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle2 },
  Closed: { color: 'text-gray-400', bg: 'bg-gray-500/10', icon: CheckCircle2 },
};

export default function CustomerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketType[]>([]);

  useEffect(() => {
    const all = ticketStore.getTickets();
    const email = user?.email || localStorage.getItem('mock_registered_email') || '';
    const mine = email
      ? all.filter((t) => t.user_id.toLowerCase().includes(email.toLowerCase()))
      : all;
    setTickets(mine);
  }, [user]);

  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In_Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;
  const recentTickets = tickets.slice(0, 5);
  const ticketsWithReplies = tickets.filter((t) => (t.agent_responses?.length ?? 0) > 0);
  const latestReply = ticketsWithReplies[0]?.agent_responses?.[ticketsWithReplies[0].agent_responses!.length - 1];
  const hourOfDay = new Date().getHours();
  const greeting = hourOfDay < 12 ? 'Good morning' : hourOfDay < 18 ? 'Good afternoon' : 'Good evening';

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.4 },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome Banner */}
      <motion.div {...fadeUp(0)} className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-teal-600/10 to-transparent" />
        <div className="absolute inset-0 bg-[var(--bg-secondary)] opacity-70" />
        <div className="relative p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Customer Portal</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {greeting}, {user?.full_name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">
              {openCount > 0
                ? `You have ${openCount} open ticket${openCount !== 1 ? 's' : ''} awaiting support.`
                : 'All your tickets are resolved — great job! 🎉'}
            </p>
          </div>
          <Button onClick={() => navigate('/tickets/create')} className="shrink-0 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500">
            <Plus className="w-4 h-4" /> Create Ticket
          </Button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Tickets', value: tickets.length, icon: Ticket, color: 'text-indigo-400', bg: 'bg-indigo-500/10', filter: 'All' },
          { label: 'Open', value: openCount, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', filter: 'Open' },
          { label: 'In Progress', value: inProgressCount, icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/10', filter: 'In_Progress' },
          { label: 'Resolved', value: resolvedCount, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', filter: 'Resolved' },
        ].map((stat, i) => (
          <motion.button
            key={stat.label}
            {...fadeUp(i * 0.06)}
            onClick={() => navigate('/tickets')}
            className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 text-left hover:border-emerald-500/30 hover:shadow-md transition-all group"
          >
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', stat.bg)}>
              <stat.icon className={cn('w-4 h-4', stat.color)} />
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{stat.label}</p>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets */}
        <motion.div {...fadeUp(0.1)} className="lg:col-span-2">
          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-primary)]">
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Ticket className="w-4 h-4 text-emerald-400" /> Recent Tickets
              </h2>
              <button
                onClick={() => navigate('/tickets')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-[var(--border-primary)]">
              {recentTickets.length === 0 ? (
                <div className="py-12 text-center">
                  <Ticket className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-3" />
                  <p className="text-sm text-[var(--text-secondary)]">No tickets yet</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">Create your first support ticket to get started</p>
                  <Button size="sm" className="mt-4 mx-auto" onClick={() => navigate('/tickets/create')}>
                    <Plus className="w-3.5 h-3.5" /> Create Ticket
                  </Button>
                </div>
              ) : (
                recentTickets.map((ticket) => {
                  const meta = STATUS_META[ticket.status] || STATUS_META.Open;
                  const StatusIcon = meta.icon;
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="flex items-start gap-3 px-5 py-3.5 hover:bg-[var(--bg-tertiary)] cursor-pointer transition-colors group"
                    >
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', meta.bg)}>
                        <StatusIcon className={cn('w-4 h-4', meta.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{ticket.id}</span>
                          <Badge variant="priority" size="sm">{ticket.priority}</Badge>
                          {(ticket.agent_responses?.length ?? 0) > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                              <MessageSquare className="w-2.5 h-2.5" /> Reply
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors truncate">
                          {ticket.title}
                        </p>
                        <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                          {new Date(ticket.created_at).toLocaleDateString()} · {ticket.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', meta.bg, meta.color)}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Sidebar: Quick Actions + Latest Reply */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <motion.div {...fadeUp(0.15)} className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Create New Ticket', icon: Plus, path: '/tickets/create', accent: 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20' },
                { label: 'Track Ticket Status', icon: Search, path: '/track-ticket', accent: 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20' },
                { label: 'Chat with AI Assistant', icon: Bot, path: '/ai-chat', accent: 'text-violet-400 bg-violet-500/10 hover:bg-violet-500/20' },
                { label: 'View Notifications', icon: Bell, path: '/notifications', accent: 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left',
                    action.accent
                  )}
                >
                  <action.icon className="w-4 h-4 flex-shrink-0" />
                  {action.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Latest Agent Reply */}
          {latestReply && ticketsWithReplies[0] && (
            <motion.div {...fadeUp(0.2)} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> New Reply
              </h3>
              <p className="text-[11px] font-mono text-[var(--text-tertiary)] mb-1">{ticketsWithReplies[0].id}</p>
              <p className="text-xs font-semibold text-[var(--text-primary)] mb-2 line-clamp-1">{ticketsWithReplies[0].title}</p>
              <div className="bg-[var(--bg-secondary)] rounded-lg p-2.5 mb-3">
                <p className="text-xs font-semibold text-emerald-400 mb-1">{latestReply.agent_name}</p>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-3 leading-relaxed">{latestReply.response_text}</p>
              </div>
              <button
                onClick={() => navigate(`/tickets/${ticketsWithReplies[0].id}`)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View Full Thread <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {/* SLA / Response Time Tip */}
          <motion.div {...fadeUp(0.25)} className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-bold text-[var(--text-primary)]">Response SLA</h3>
            </div>
            <div className="space-y-2">
              {[
                { priority: 'Critical', time: '1 hour', bar: 'w-full bg-red-500' },
                { priority: 'High', time: '4 hours', bar: 'w-3/4 bg-orange-500' },
                { priority: 'Medium', time: '8 hours', bar: 'w-1/2 bg-amber-500' },
                { priority: 'Low', time: '24 hours', bar: 'w-1/4 bg-green-500' },
              ].map((sla) => (
                <div key={sla.priority} className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-[var(--text-tertiary)] w-14 shrink-0">{sla.priority}</span>
                  <div className="flex-1 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', sla.bar)} />
                  </div>
                  <span className="text-[10px] text-[var(--text-tertiary)] w-14 text-right shrink-0">{sla.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Insight Tip */}
          <motion.div {...fadeUp(0.3)} className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-bold text-[var(--text-primary)]">AI Tip</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Our AI can analyze screenshots and auto-fill your ticket! Try the <strong className="text-violet-400">Screenshot (AI)</strong> mode when creating your next ticket.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
