'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, Brain, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLearn } from '@/lib/learn/store';

const nav = [
  { href: '/home', label: 'Bosh sahifa', icon: Home },
  { href: '/lessons', label: 'Darslar', icon: Map },
  { href: '/practice', label: 'Amaliyot', icon: Brain },
  { href: '/profile', label: 'Profil', icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state } = useLearn();

  return (
    <div className="min-h-screen bg-learn-bg text-learn-text learn-theme">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-learn-border bg-learn-bg/90 backdrop-blur-xl lg:left-56">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <Link href="/home" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-learn-accent to-learn-pink text-sm font-bold text-white">
              IN
            </span>
            <span className="font-semibold">Inter Learn</span>
          </Link>
          <div className="flex items-center gap-2 text-sm sm:gap-3">
            <span className="rounded-full bg-learn-card px-2.5 py-1 text-xs font-semibold text-amber-400 sm:px-3 sm:text-sm">
              🪙 {state.user.coins.toLocaleString('uz-UZ')}
            </span>
            <span className="rounded-full bg-learn-card px-2.5 py-1 text-xs font-semibold text-cyan-400 sm:px-3 sm:text-sm">
              ⭐ {state.user.scores.toLocaleString('uz-UZ')}
            </span>
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 right-0 z-40 border-t border-learn-border bg-learn-surface/95 backdrop-blur-xl lg:bottom-auto lg:left-0 lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:w-56 lg:border-r lg:border-t-0">
        <nav
          className="mx-auto flex max-w-lg justify-around py-2 lg:mx-0 lg:flex-col lg:justify-start lg:gap-1 lg:p-4"
          aria-label="Asosiy navigatsiya"
        >
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium lg:flex-row lg:gap-3 lg:rounded-xl lg:px-3 lg:py-2.5 lg:text-sm',
                  active
                    ? 'text-learn-accent lg:bg-learn-accent/15'
                    : 'text-learn-muted lg:hover:bg-learn-card lg:hover:text-learn-text'
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="min-h-screen pt-14 pb-24 lg:ml-56 lg:pb-8 lg:pt-14">
        <div className="mx-auto max-w-4xl px-4 py-4 lg:px-6 lg:py-6">{children}</div>
      </main>
    </div>
  );
}
