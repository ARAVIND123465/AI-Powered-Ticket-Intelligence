import { useEffect, useState } from 'react';
import {
  Ticket, AlertTriangle, CheckCircle2, Clock, Zap, Users,
  Timer, TrendingUp, Shield, CalendarDays, CalendarRange, Calendar,
} from 'lucide-react';
import StatsCard from './StatsCard';
import { ticketStore } from '@/utils/ticketStore';
import { isToday, subDays } from 'date-fns';
import type { Ticket as TicketType } from '@/types';

export default function StatsGrid() {
  const [tickets, setTickets] = useState<TicketType[]>([]);

  useEffect(() => {
    // Initial fetch
    setTickets(ticketStore.getTickets());
    
    // Poll localstorage every second to reflect real-time ticket additions instantly
    const interval = setInterval(() => {
      setTickets(ticketStore.getTickets());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const total = tickets.length;
  const open = tickets.filter(t => t.status === 'Open' || t.status === 'In_Progress').length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;
  const critical = tickets.filter(t => t.priority === 'Critical').length;
  const high = tickets.filter(t => t.priority === 'High').length;
  const pending = tickets.filter(t => t.status === 'In_Progress').length;
  const closed = tickets.filter(t => t.status === 'Closed').length;

  const todayCount = tickets.filter(t => isToday(new Date(t.created_at))).length;
  const weekCount = tickets.filter(t => {
    const d = new Date(t.created_at);
    return d >= subDays(new Date(), 7);
  }).length;
  const monthCount = tickets.filter(t => {
    const d = new Date(t.created_at);
    return d >= subDays(new Date(), 30);
  }).length;

  const stats = [
    { icon: <Ticket className="w-5 h-5" />, label: 'Total Tickets', value: total, trend: { value: 12, label: '' }, color: '#6366f1' },
    { icon: <AlertTriangle className="w-5 h-5" />, label: 'Open Tickets', value: open, trend: { value: -5, label: '' }, color: '#f97316' },
    { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Resolved', value: resolved, trend: { value: 8, label: '' }, color: '#22c55e' },
    { icon: <Zap className="w-5 h-5" />, label: 'Critical', value: critical, trend: { value: -15, label: '' }, color: '#ef4444' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'High Priority', value: high, trend: { value: 3, label: '' }, color: '#f59e0b' },
    { icon: <Clock className="w-5 h-5" />, label: 'Pending', value: pending, color: '#8b5cf6' },
    { icon: <Shield className="w-5 h-5" />, label: 'Closed', value: closed, trend: { value: 10, label: '' }, color: '#06b6d4' },
    { icon: <Timer className="w-5 h-5" />, label: 'Avg Resolution', value: '3.2h', trend: { value: -12, label: '' }, color: '#14b8a6' },
    { icon: <Users className="w-5 h-5" />, label: 'CSAT Score', value: '96%', trend: { value: 2, label: '' }, color: '#22c55e' },
    { icon: <CalendarDays className="w-5 h-5" />, label: "Today's Tickets", value: todayCount, color: '#6366f1' },
    { icon: <CalendarRange className="w-5 h-5" />, label: 'This Week', value: weekCount, trend: { value: 7, label: '' }, color: '#8b5cf6' },
    { icon: <Calendar className="w-5 h-5" />, label: 'This Month', value: monthCount, trend: { value: 4, label: '' }, color: '#a78bfa' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {stats.map((stat, i) => (
        <StatsCard key={stat.label} {...stat} value={stat.value.toString()} delay={i * 0.05} />
      ))}
    </div>
  );
}

