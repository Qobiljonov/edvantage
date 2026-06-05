'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeUp } from '@/lib/motion';

interface MetricTileProps {
  label: string;
  value: string | number;
  hint?: string;
  trend?: { value: string; up?: boolean };
  icon?: LucideIcon;
  accent?: 'blue' | 'teal' | 'gold' | 'ink';
  className?: string;
}

const accents = {
  blue: 'bg-brand-50 text-brand-700',
  teal: 'bg-teal-500/10 text-teal-600',
  gold: 'bg-gold-400/10 text-gold-600',
  ink: 'bg-ink-100 text-ink-700',
};

export function MetricTile({
  label,
  value,
  hint,
  trend,
  icon: Icon,
  accent = 'blue',
  className,
}: MetricTileProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn('surface group p-5 md:p-6 transition-shadow hover:shadow-medium', className)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="label-caps">{label}</p>
          <p className="mt-2 text-[1.75rem] font-semibold tracking-tight text-ink tabular-nums">
            {value}
          </p>
          {hint && <p className="mt-1 text-2xs text-ink-tertiary">{hint}</p>}
          {trend && (
            <p
              className={cn(
                'mt-2 inline-flex items-center gap-1 text-2xs font-medium',
                trend.up ? 'text-teal-600' : 'text-ink-tertiary'
              )}
            >
              {trend.up ? (
                <TrendingUp className="h-3 w-3" aria-hidden />
              ) : (
                <TrendingDown className="h-3 w-3" aria-hidden />
              )}
              {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
              accents[accent]
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </div>
        )}
      </div>
    </motion.div>
  );
}
