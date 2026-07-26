import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ShieldAlert, CheckCheck, RefreshCw, Server, AlertTriangle, Key } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import type { SANotification } from '../superAdminData';
import { formatRelative } from '@/utils/formatters';

interface Props {
  notifications: SANotification[];
  onUpdateNotifications: (notifications: SANotification[]) => void;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  new_registration: { icon: Bell, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  platform_error: { icon: Server, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  ai_failure: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  subscription_expired: { icon: RefreshCw, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  security_alert: { icon: Key, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  high_server_usage: { icon: Server, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
};

export default function SANotificationsTab({ notifications, onUpdateNotifications }: Props) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unread = notifications.filter(n => !n.read);
  const filtered = filter === 'unread' ? unread : notifications;

  const markAllRead = () => {
    onUpdateNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('All platform notifications marked as read.');
  };

  const markSingleRead = (id: string) => {
    onUpdateNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">SaaS Platform Alerts</h3>
          {unread.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse">
              {unread.length} unresolved alerts
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-primary)] p-0.5">
            <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === 'all' ? 'bg-primary-600 text-white' : 'text-[var(--text-secondary)]'}`}>All</button>
            <button onClick={() => setFilter('unread')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === 'unread' ? 'bg-primary-600 text-white' : 'text-[var(--text-secondary)]'}`}>Unread</button>
          </div>
          {unread.length > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead} className="flex items-center gap-1.5 text-xs">
              <CheckCheck className="w-3.5 h-3.5" /> Dismiss All
            </Button>
          )}
        </div>
      </motion.div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center text-xs text-[var(--text-tertiary)]">
            No system notifications found.
          </Card>
        ) : (
          filtered.map((item, i) => {
            const config = typeConfig[item.type] || typeConfig.new_registration;
            const Icon = config.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={`p-4 flex gap-4 transition-all duration-200 ${!item.read ? 'border-l-2 border-l-primary-500 bg-primary-500/[0.01]' : 'opacity-70'}`}>
                  <div className={`w-9 h-9 rounded-xl ${config.bg} ${config.border} border flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{item.title}</h4>
                      {!item.read && <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shrink-0" />}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{item.message}</p>
                    <span className="text-[9px] text-[var(--text-tertiary)] font-mono mt-1 block">{formatRelative(item.timestamp)}</span>
                  </div>
                  {!item.read && (
                    <button onClick={() => markSingleRead(item.id)} className="p-1 text-[var(--text-tertiary)] hover:text-primary-400 transition-colors" title="Acknowledge">
                      <CheckCheck className="w-4 h-4" />
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
