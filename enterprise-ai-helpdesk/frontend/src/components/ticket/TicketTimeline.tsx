import { motion } from 'framer-motion';
import { Plus, Brain, User, CheckCircle, AlertTriangle } from 'lucide-react';

const DEMO_EVENTS = [
  { type: 'created', text: 'Ticket created by john@company.com', time: '10:30 AM', icon: <Plus className="w-3 h-3" />, color: '#6366f1' },
  { type: 'ai', text: 'AI classified as "Network" (87% confidence)', time: '10:30 AM', icon: <Brain className="w-3 h-3" />, color: '#8b5cf6' },
  { type: 'ai', text: 'Priority set to High via ML prediction', time: '10:30 AM', icon: <AlertTriangle className="w-3 h-3" />, color: '#f97316' },
  { type: 'assigned', text: 'Assigned to Alex Martinez (AI suggestion)', time: '10:32 AM', icon: <User className="w-3 h-3" />, color: '#06b6d4' },
  { type: 'resolved', text: 'Marked as resolved by agent', time: '2:45 PM', icon: <CheckCircle className="w-3 h-3" />, color: '#22c55e' },
];

export default function TicketTimeline() {
  return (
    <div className="space-y-0">
      {DEMO_EVENTS.map((event, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-start gap-3 relative pl-6 pb-5 last:pb-0"
        >
          {/* Line */}
          {i < DEMO_EVENTS.length - 1 && (
            <div className="absolute left-[11px] top-6 w-px h-full bg-[var(--border-primary)]" />
          )}
          {/* Dot */}
          <div
            className="absolute left-0 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${event.color}20`, color: event.color }}
          >
            {event.icon}
          </div>
          <div className="pt-0.5">
            <p className="text-xs text-[var(--text-primary)]">{event.text}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{event.time}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
