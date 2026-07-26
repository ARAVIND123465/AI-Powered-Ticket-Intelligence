import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, AlertTriangle, Clock, MessageSquare, UserX, Zap, Ticket,
  CheckCheck, Eye,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import type { CANotification } from '../companyAdminData';
import { formatRelative } from '@/utils/formatters';

interface Props {
  notifications: CANotification[];
  onUpdateNotifications: (notifications: CANotification[]) => void;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  new_ticket: { icon: Ticket, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  escalated: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  sla_expiring: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  customer_reply: { icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  agent_unavailable: { icon: UserX, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  high_priority: { icon: Zap, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

const severityBadge = (s: string) =>
  s === 'critical' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
  s === 'warning' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
  'bg-blue-500/15 text-blue-400 border-blue-500/30';

export default function CANotificationsTab({ notifications, onUpdateNotifications }: Props) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const markAsRead = (id: string) => {
    onUpdateNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    onUpdateNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Notifications</h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-primary)] p-0.5">
            <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'all' ? 'bg-primary-600 text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>All</button>
            <button onClick={() => setFilter('unread')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'unread' ? 'bg-primary-600 text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Unread</button>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="flex items-center gap-1.5 text-xs">
              <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
            </Button>
          )}
        </div>
      </motion.div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-3" />
            <p className="text-sm font-medium text-[var(--text-primary)]">No notifications</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">{filter === 'unread' ? 'All caught up!' : 'No notifications yet'}</p>
          </Card>
        ) : (
          filtered.map((notification, i) => {
            const config = typeConfig[notification.type] || typeConfig.new_ticket;
            const Icon = config.icon;
            return (
              <motion.div key={notification.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className={`p-4 flex items-start gap-4 transition-all duration-200 ${!notification.read ? 'border-l-2 border-l-primary-500 bg-primary-500/[0.02]' : 'opacity-75'}`}>
                  <div className={`w-9 h-9 rounded-xl ${config.bg} ${config.border} border flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{notification.title}</h4>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${severityBadge(notification.severity)}`}>
                        {notification.severity}
                      </span>
                      {!notification.read && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">{notification.message}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-[var(--text-tertiary)]">{formatRelative(notification.createdAt)}</span>
                      {notification.ticketId && (
                        <span className="text-[10px] font-mono text-primary-400">{notification.ticketId}</span>
                      )}
                    </div>
                  </div>
                  {!notification.read && (
                    <button onClick={() => markAsRead(notification.id)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-primary-400 transition-colors shrink-0" title="Mark as read">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
