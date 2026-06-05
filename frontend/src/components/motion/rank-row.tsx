'use client';

import { motion } from 'framer-motion';
import { rankRow, medalGlow } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface RankRowProps {
  index: number;
  rank: number;
  children: ReactNode;
  className?: string;
  highlight?: boolean;
}

export function RankRow({ index, rank, children, className, highlight }: RankRowProps) {
  const isMedal = rank <= 3;

  return (
    <motion.div
      custom={index}
      variants={rankRow}
      initial="initial"
      animate="animate"
      layout
      className={cn(
        'flex items-center gap-4 px-5 py-4 sm:px-6',
        highlight && 'bg-brand-50/80',
        className
      )}
    >
      {isMedal ? (
        <motion.span
          initial={medalGlow.initial}
          animate={medalGlow.animate}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg',
            rank === 1 && 'bg-gold-400/25 shadow-[0_0_20px_rgba(191,143,42,0.35)]',
            rank === 2 && 'bg-ink-100',
            rank === 3 && 'bg-orange-100/80 shadow-[0_0_16px_rgba(255,149,0,0.2)]'
          )}
          aria-label={`${rank}-o'rin`}
        >
          {['🥇', '🥈', '🥉'][rank - 1]}
        </motion.span>
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-ink-tertiary">
          {rank}
        </span>
      )}
      {children}
    </motion.div>
  );
}
