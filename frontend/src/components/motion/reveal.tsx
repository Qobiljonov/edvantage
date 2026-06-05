'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeUp } from '@/lib/motion';

interface RevealProps extends HTMLMotionProps<'div'> {
  delay?: number;
  once?: boolean;
}

export function Reveal({ children, className, delay = 0, once = true, ...props }: RevealProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      custom={delay}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
