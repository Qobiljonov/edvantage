'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FlowStepProps {
  step: number;
  title: string;
  description: string;
  icon: ReactNode;
  index: number;
}

export function FlowStep({ step, title, description, icon, index }: FlowStepProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div ref={ref} className="flex flex-col items-center">
      <motion.article
        initial={{ opacity: 0, x: -24 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{
          duration: 0.5,
          delay: index * 0.1,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={cn(
          'surface flex w-full max-w-md items-start gap-4 p-5',
          inView && 'ring-1 ring-brand-500/20 shadow-glow'
        )}
      >
        <motion.span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white"
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ delay: index * 0.1 + 0.15, type: 'spring', stiffness: 400, damping: 22 }}
        >
          {step}
        </motion.span>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-2xs leading-relaxed text-ink-secondary">{description}</p>
        </div>
      </motion.article>
      {index < 6 && (
        <motion.div
          className="my-2 h-6 w-px bg-gradient-to-b from-brand-300 to-brand-600"
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ delay: index * 0.1 + 0.25, duration: 0.35 }}
          style={{ originY: 0 }}
        />
      )}
    </div>
  );
}
