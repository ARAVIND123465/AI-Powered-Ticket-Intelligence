import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: { value: number; label: string };
  color?: string;
  delay?: number;
}

export default function StatsCard({ icon, label, value, trend, color = '#6366f1', delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 hover:border-[var(--border-accent)] hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${color}18` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
        {trend && (
          <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', trend.value >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400')}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">{value}</p>
        <p className="text-xs text-[var(--text-tertiary)] font-medium">{label}</p>
      </div>
    </motion.div>
  );
}
