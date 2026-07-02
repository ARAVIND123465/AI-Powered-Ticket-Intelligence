import { cn } from '@/utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

export default function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div className={cn('animate-spin rounded-full border-2 border-[var(--border-primary)] border-t-primary-500', sizes[size], className)} />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-[var(--text-tertiary)] animate-pulse">Loading…</p>
      </div>
    </div>
  );
}
