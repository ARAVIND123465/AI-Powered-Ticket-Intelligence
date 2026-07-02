import { cn } from '@/utils/cn';

interface AvatarProps {
  name?: string | null;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-12 h-12 text-sm' };

function getInitials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

function getColor(name?: string | null): string {
  if (!name) return 'hsl(0, 0%, 40%)';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${hash % 360}, 65%, 55%)`;
}

export default function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={cn('rounded-full object-cover ring-2 ring-[var(--border-primary)]', sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-[var(--border-primary)]',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: getColor(name) }}
    >
      {getInitials(name)}
    </div>
  );
}
