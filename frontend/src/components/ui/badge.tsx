import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'gold';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-brand-50 text-brand-700 ring-1 ring-brand-100',
    success: 'bg-teal-500/10 text-teal-700 ring-1 ring-teal-500/20',
    warning: 'bg-amber-50 text-amber-800 ring-1 ring-amber-100',
    danger: 'bg-red-50 text-red-700 ring-1 ring-red-100',
    outline: 'bg-ink-50 text-ink-secondary ring-1 ring-ink-200',
    gold: 'bg-gold-400/10 text-gold-600 ring-1 ring-gold-400/20',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-2xs font-semibold',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
