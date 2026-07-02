import { cn } from '@/utils/cn';
import { PRIORITY_COLORS, STATUS_COLORS, SENTIMENT_COLORS } from '@/constants';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'priority' | 'status' | 'sentiment' | 'success' | 'warning' | 'danger' | 'info';
  color?: string;
  className?: string;
  size?: 'sm' | 'md';
}

const variantClasses = {
  default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-primary)]',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/15 text-red-400 border-red-500/20',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  priority: '',
  status: '',
  sentiment: '',
};

function getColorStyle(variant: string, children: React.ReactNode) {
  const text = typeof children === 'string' ? children : '';
  const colorMap: Record<string, string> = {
    priority: PRIORITY_COLORS[text] || '',
    status: STATUS_COLORS[text] || '',
    sentiment: SENTIMENT_COLORS[text] || '',
  };
  const c = colorMap[variant];
  if (!c) return {};
  return {
    backgroundColor: `${c}18`,
    color: c,
    borderColor: `${c}30`,
  };
}

export default function Badge({ children, variant = 'default', color, className, size = 'sm' }: BadgeProps) {
  const dynamicStyle = ['priority', 'status', 'sentiment'].includes(variant)
    ? getColorStyle(variant, children)
    : color
      ? { backgroundColor: `${color}18`, color, borderColor: `${color}30` }
      : {};

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-full whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        variantClasses[variant],
        className
      )}
      style={dynamicStyle}
    >
      {children}
    </span>
  );
}
