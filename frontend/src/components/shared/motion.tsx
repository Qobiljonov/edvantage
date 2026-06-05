'use client';

import { Reveal } from '@/components/motion/reveal';

export { Reveal };

/** FadeUp — Reveal alias (oldingi API) */
export function FadeUp({
  children,
  className,
  delay = 0,
  ...props
}: React.ComponentProps<typeof Reveal>) {
  return (
    <Reveal delay={delay} className={className} {...props}>
      {children}
    </Reveal>
  );
}
