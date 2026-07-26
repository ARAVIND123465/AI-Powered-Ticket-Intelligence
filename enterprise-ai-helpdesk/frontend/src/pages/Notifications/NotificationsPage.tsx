import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, MessageSquare, CheckCircle2, AlertTriangle, Brain, Ticket,
  Settings, Filter, Check, Trash2, ChevronRight, Clock, Zap,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

type NotifType = 'reply' | 'status' | 'ai_alert' | 'escalation' | 'system';

interface LocalNotification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  ticketId?: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: LocalNotification[] = [
  {
    id: 'N-001', type: 'reply', title: 'Agent Replied to Your Ticket',
    message: 'Support Agent Alex Rivera has responded to TKT-1041: "We have identified the issue with the payment gateway. Fix being deployed."',
    ticketId: 'TKT-1041', time: '5 minutes ago', read: false,
  },
  {
    id: 'N-002', type: 'status', title: 'Ticket Status Changed',
    message: 'TKT-1042 (VPN connection drops) has been moved to In Progress by your support agent.',
    ticketId: 'TKT-1042', time: '23 minutes ago', read: false,
  },
  {
    id: 'N-003', type: 'ai_alert', title: 'AI Classification Update',
    message: 'TKT-1040 was reclassified from Security to Access Control with 94.2% confidence. Priority upgraded to Critical.',
    ticketId: 'TKT-1040', time: '1 hour ago', read: false,
  },
  {
    id: 'N-004', type: 'escalation', title: 'Ticket Escalated',
    message: 'TKT-1041 has been escalated to Tier 2 support. Expected resolution within 1 hour.',
    ticketId: 'TKT-1041', time: '2 hours ago', read: true,
  },
  {
    id: 'N-005', type: 'status', title: 'Ticket Resolved ✓',
    message: 'TKT-1039 (Dashboard charts not loading on Safari) has been marked Resolved. Please rate your experience.',
    ticketId: 'TKT-1039', time: '3 hours ago', read: true,
  },
  {
    id: 'N-006', type: 'ai_alert', title: 'Duplicate Detected',
    message: 'AI flagged TKT-1040 as a potential duplicate of TKT-998. Similarity score: 87.3%.',
    ticketId: 'TKT-1040', time: '5 hours ago', read: true,
  },
  {
    id: 'N-007', type: 'reply', title: 'New Agent Message',
    message: 'Support Bot has posted an automated acknowledgement: "Ticket received, routing to the appropriate team."',
    ticketId: 'TKT-1042', time: '6 hours ago', read: true,
  },
  {
    id: 'N-008', type: 'system', title: 'System Maintenance Scheduled',
    message: 'Platform maintenance is scheduled for Sunday, 2:00 AM – 4:00 AM IST. Ticket submission will be unavailable.',
    time: 'Yesterday', read: true,
  },
];

const TYPE_META: Record<NotifType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  reply: { icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Agent Reply' },
  status: { icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Status Update' },
  ai_alert: { icon: Brain, color: 'text-violet-400', bg: 'bg-violet-500/10', label: 'AI Alert' },
  escalation: { icon: Zap, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Escalation' },
  system: { icon: Settings, color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'System' },
};

const FILTERS: { label: string; value: 'all' | NotifType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Replies', value: 'reply' },
  { label: 'Status Updates', value: 'status' },
  { label: 'AI Alerts', value: 'ai_alert' },
  { label: 'Escalations', value: 'escalation' },
  { label: 'System', value: 'system' },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<LocalNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<'all' | NotifType>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (activeFilter !== 'all' && n.type !== activeFilter) return false;
    if (showUnreadOnly && n.read) return false;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notifications</h1>
            {unreadCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">{unreadCount}</span>
            )}
          </div>
          <p className="text-sm text-[var(--text-tertiary)]">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <Check className="w-3.5 h-3.5" /> Mark All Read
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-[var(--bg-tertiary)] rounded-xl p-1 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                activeFilter === f.value
                  ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
            showUnreadOnly
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
              : 'border-[var(--border-primary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
          )}
        >
          <Filter className="w-3.5 h-3.5" /> Unread Only
        </button>
      </motion.div>

      {/* Notification List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)]"
            >
              <Bell className="w-12 h-12 text-[var(--text-tertiary)] mb-3" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">No notifications</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {showUnreadOnly ? 'No unread notifications.' : 'You\'re all caught up!'}
              </p>
            </motion.div>
          ) : (
            filtered.map((notif, i) => {
              const meta = TYPE_META[notif.type];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8, height: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    'rounded-2xl border bg-[var(--bg-secondary)] p-4 flex items-start gap-3 group transition-all hover:border-[var(--border-accent)] hover:shadow-sm',
                    !notif.read
                      ? 'border-[var(--border-accent)] bg-[var(--bg-secondary)]'
                      : 'border-[var(--border-primary)] opacity-80 hover:opacity-100'
                  )}
                >
                  {/* Type Icon */}
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', meta.bg)}>
                    <Icon className={cn('w-4.5 h-4.5', meta.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={cn('text-[10px] font-bold uppercase tracking-wider', meta.color)}>{meta.label}</span>
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">{notif.title}</p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {notif.time}
                      </span>
                      {notif.ticketId && (
                        <button
                          onClick={() => {
                            markAsRead(notif.id);
                            navigate(`/tickets/${notif.ticketId}`);
                          }}
                          className={cn(
                            'text-[10px] font-semibold flex items-center gap-0.5 transition-colors',
                            meta.color, 'hover:opacity-80'
                          )}
                        >
                          View {notif.ticketId} <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-green-400 hover:bg-green-500/10 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Summary footer */}
      {filtered.length > 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-xs text-[var(--text-tertiary)] text-center"
        >
          Showing {filtered.length} of {notifications.length} notifications
        </motion.p>
      )}
    </div>
  );
}
