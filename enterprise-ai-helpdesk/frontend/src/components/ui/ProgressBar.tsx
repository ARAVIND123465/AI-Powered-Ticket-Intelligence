import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  color?: string;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export default function ProgressBar({ value, max = 100, color, className, showLabel = false, size = 'md' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color || (pct > 80 ? '#22c55e' : pct > 50 ? '#f59e0b' : pct > 20 ? '#f97316' : '#ef4444');

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full rounded-full bg-[var(--bg-tertiary)] overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2.5')}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-[var(--text-tertiary)] mt-1">{Math.round(pct)}%</p>
      )}
    </div>
  );
}
