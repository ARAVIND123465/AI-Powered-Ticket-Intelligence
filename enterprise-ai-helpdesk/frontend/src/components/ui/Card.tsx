import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, hover = false, glow = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5 transition-all duration-300',
        hover && 'hover:border-[var(--border-accent)] hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',
        glow && 'shadow-[var(--shadow-glow)]',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-sm font-semibold text-[var(--text-primary)]', className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-xs text-[var(--text-tertiary)] mt-0.5', className)}>{children}</p>;
}
