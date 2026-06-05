'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface FeatureCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FeatureCard({ children, className, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
      }}
      className={cn(
        'group relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6',
        'transition-shadow duration-300',
        'hover:border-white/15 hover:bg-white/[0.06]',
        'hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]',
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(59,130,246,0.08), transparent 40%)',
        }}
      />
      {children}
    </motion.div>
  );
}
