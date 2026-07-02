import { motion } from 'framer-motion';
import { Brain, AlertTriangle, Copy, TrendingUp } from 'lucide-react';

const DEMO_ACTIVITIES = [
  { icon: <Brain className="w-3.5 h-3.5" />, text: 'TKT-1042 classified as Network (87% confidence)', time: '2 min ago', color: '#6366f1' },
  { icon: <AlertTriangle className="w-3.5 h-3.5" />, text: 'TKT-1041 auto-escalated — frustrated customer detected', time: '5 min ago', color: '#ef4444' },
  { icon: <Copy className="w-3.5 h-3.5" />, text: 'TKT-1040 flagged as potential duplicate of TKT-987 (78%)', time: '12 min ago', color: '#f59e0b' },
  { icon: <TrendingUp className="w-3.5 h-3.5" />, text: 'Payment tickets trending +23% vs last week — spike alert', time: '18 min ago', color: '#f97316' },
  { icon: <Brain className="w-3.5 h-3.5" />, text: 'AI resolution generated for TKT-1039 using 3 similar tickets', time: '25 min ago', color: '#22c55e' },
  { icon: <Brain className="w-3.5 h-3.5" />, text: 'Priority prediction updated for TKT-1038: Low → Medium', time: '32 min ago', color: '#8b5cf6' },
];

export default function AIActivityFeed() {
  return (
    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border-primary)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">AI Activity Feed</h3>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Real-time ML pipeline actions</p>
      </div>
      <div className="divide-y divide-[var(--border-primary)]">
        {DEMO_ACTIVITIES.map((activity, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="px-5 py-3 flex items-start gap-3"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${activity.color}18`, color: activity.color }}>
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--text-primary)] leading-relaxed">{activity.text}</p>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
