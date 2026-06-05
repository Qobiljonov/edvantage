'use client';

import { Bell, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { student } from '@/lib/mock-data';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AppHeader({ title, subtitle, actions }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-200/60 bg-[hsl(var(--background))]/85 backdrop-blur-xl backdrop-saturate-150">
      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 lg:py-5">
        <div className="min-w-0 pl-12 lg:pl-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 truncate text-2xs text-ink-tertiary sm:text-sm">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {actions}
          <label className="relative hidden md:block">
            <span className="sr-only">Qidirish</span>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Qidirish..."
              className="h-10 w-52 rounded-full border border-ink-200 bg-white pl-10 pr-4 text-sm text-ink placeholder:text-ink-tertiary transition focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 lg:w-64"
            />
          </label>
          <div className="hidden items-center gap-1.5 rounded-full bg-ink-950 px-3.5 py-2 sm:flex">
            <span className="text-2xs font-semibold text-white tabular-nums">
              {student.xp.toLocaleString('uz-UZ')} XP
            </span>
          </div>
          <Badge variant="gold" className="hidden sm:inline-flex">
            {student.streak} kun
          </Badge>
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-white transition hover:border-ink-300"
            aria-label="Bildirishnomalar (3 yangi)"
          >
            <Bell className="h-[18px] w-[18px] text-ink-secondary" strokeWidth={1.75} />
            <span
              className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white"
              aria-hidden
            />
          </button>
        </div>
      </div>
    </header>
  );
}
