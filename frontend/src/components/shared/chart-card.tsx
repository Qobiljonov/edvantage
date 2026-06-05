import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, action, children, className }: ChartCardProps) {
  return (
    <div className={cn('surface overflow-hidden', className)}>
      <div className="flex items-start justify-between gap-4 border-b border-ink-100/80 px-5 py-4 md:px-6 md:py-5">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-2xs text-ink-tertiary">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}
