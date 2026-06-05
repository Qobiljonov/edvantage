'use client';

import * as React from "react";
import { motion } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

export interface MotionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    React.ComponentProps<typeof Button> {
  asChild?: boolean;
}

const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ className, variant, size, asChild = false, onClick, children, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<{ x: number; y: number; id: number }[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      setRipples((r) => [...r, { x, y, id }]);
      setTimeout(() => setRipples((r) => r.filter((rip) => rip.id !== id)), 600);
      onClick?.(e);
    };

    const MotionComp = motion(Button as any);
    const Comp: any = asChild ? Slot : MotionComp;

    const motionProps = asChild
      ? {}
      : {
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.97 },
          transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
        };

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={handleClick}
        {...motionProps}
        {...props}
      >
        {!asChild &&
          ripples.map((r) => (
            <motion.span
              key={r.id}
              className="pointer-events-none absolute rounded-full bg-white/30"
              style={{ left: r.x, top: r.y, width: 8, height: 8, marginLeft: -4, marginTop: -4 }}
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 24, opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </Comp>
    );
  }
);
MotionButton.displayName = "MotionButton";

export { MotionButton };
