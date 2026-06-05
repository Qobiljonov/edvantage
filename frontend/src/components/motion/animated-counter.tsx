'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, animate } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  className,
  duration = 1.6,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        const formatted =
          decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString('uz-UZ');
        setDisplay(formatted);
      },
    });
    return () => controls.stop();
  }, [inView, value, duration, decimals]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

export function AnimatedStat({ raw, className }: { raw: string; className?: string }) {
  const match = raw.match(/^([\d\s.,]+)(.*)$/);
  if (!match) {
    return <span className={className}>{raw}</span>;
  }
  const numStr = match[1].replace(/\s/g, '').replace(',', '.');
  const suffix = match[2];
  const num = parseFloat(numStr);

  if (isNaN(num)) {
    return <span className={className}>{raw}</span>;
  }

  const decimals = numStr.includes('.') ? 2 : 0;

  return <AnimatedCounter value={num} suffix={suffix} decimals={decimals} className={className} />;
}
