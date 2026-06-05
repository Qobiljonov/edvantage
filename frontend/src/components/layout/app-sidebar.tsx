'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Brain,
  Library,
  FileQuestion,
  Timer,
  BarChart3,
  Trophy,
  Map,
  Flame,
  Settings,
  Users,
  GraduationCap,
  ChevronLeft,
  Menu,
  X,
  Home,
  Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { student } from '@/lib/mock-data';

const mainNav = [
  { href: '/dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
  { href: '/dashboard/ai-ustoz', label: 'AI Ustoz', icon: Brain },
  { href: '/dashboard/kutubxona', label: 'Kutubxona', icon: Library },
  { href: '/dashboard/bilim-dvigateli', label: 'Bilim dvigateli', icon: Cpu },
  { href: '/dashboard/test-generator', label: 'Test generatori', icon: FileQuestion },
  { href: '/dashboard/simulyator', label: 'Simulyator', icon: Timer },
];

const insightNav = [
  { href: '/dashboard/analitika', label: 'Analitika', icon: BarChart3 },
  { href: '/dashboard/reyting', label: 'Reyting', icon: Trophy },
  { href: '/dashboard/roadmap', label: "O'quv rejasi", icon: Map },
  { href: '/dashboard/gamification', label: 'Yutuqlar', icon: Flame },
];

const portalNav = [
  { href: '/dashboard/ota-ona', label: 'Ota-ona', icon: Users },
  { href: '/dashboard/oqituvchi', label: "O'qituvchi", icon: GraduationCap },
];

function NavGroup({
  label,
  items,
  pathname,
  collapsed,
  onNavigate,
}: {
  label: string;
  items: typeof mainNav;
  pathname: string;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/35">
          {label}
        </p>
      )}
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
              active ? 'nav-active' : 'text-white/55 hover:bg-white/5 hover:text-white/90'
            )}
          >
            <item.icon
              className={cn(
                'h-[18px] w-[18px] shrink-0 stroke-[1.75]',
                active ? 'text-white' : 'text-white/50 group-hover:text-white/80'
              )}
              aria-hidden
            />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      {open && (
        <button
          className="fixed inset-0 z-40 bg-ink-950/60 backdrop-blur-sm lg:hidden"
          onClick={close}
          aria-label="Menyuni yopish"
        />
      )}

      <button
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-ink-950 text-white shadow-large lg:hidden"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Navigatsiya menyusi"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          'bg-ink-950 fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/[0.06] transition-all duration-300 ease-apple',
          collapsed ? 'w-[72px]' : 'w-[260px]',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Asosiy navigatsiya"
      >
        <div className="flex h-[4.25rem] items-center gap-3 border-b border-white/[0.06] px-4">
          <Link
            href="/"
            className="flex h-9 w-9 shrink-0 items-center justify-center"
            aria-label="Edvantage bosh sahifa"
          >
            <Image src="/images/icon-light.png" alt="Edvantage Logo" width={36} height={36} className="h-9 w-9 object-contain" />
          </Link>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-semibold tracking-tight text-white">Edvantage</p>
              <p className="truncate text-[10px] text-white/40">Milliy AI ta&apos;lim</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto p-3 scrollbar-hide">
          <NavGroup
            label="Asosiy"
            items={mainNav}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={close}
          />
          <NavGroup
            label="Tahlil"
            items={insightNav}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={close}
          />
          <NavGroup
            label="Portallar"
            items={portalNav}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={close}
          />
        </nav>

        <div className="space-y-1 border-t border-white/[0.06] p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-white/50 hover:bg-white/5 hover:text-white/80"
          >
            <Home className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
            {!collapsed && <span>Landing</span>}
          </Link>
          <Link
            href="/dashboard/sozlamalar"
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px]',
              pathname === '/dashboard/sozlamalar' ? 'nav-active' : 'text-white/50 hover:bg-white/5'
            )}
          >
            <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
            {!collapsed && <span>Sozlamalar</span>}
          </Link>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden border-t border-white/[0.06] p-3 text-white/30 transition hover:text-white/60 lg:flex lg:justify-center"
          aria-label={collapsed ? 'Menyuni kengaytirish' : "Menyuni yig'ish"}
        >
          <ChevronLeft
            className={cn('h-5 w-5 transition-transform duration-300', collapsed && 'rotate-180')}
          />
        </button>
      </aside>
    </>
  );
}
