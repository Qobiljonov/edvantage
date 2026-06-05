'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingOrbProps {
  className?: string;
  size?: number;
  delay?: number;
  duration?: number;
}

export function FloatingOrb({ className, size = 280, delay = 0, duration = 8 }: FloatingOrbProps) {
  return (
    <motion.div
      aria-hidden
      className={cn('pointer-events-none absolute rounded-full blur-3xl', className)}
      style={{ width: size, height: size }}
      initial={{ opacity: 0.4 }}
      animate={{
        y: [0, -18, 0],
        x: [0, 10, 0],
        opacity: [0.35, 0.5, 0.35],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
