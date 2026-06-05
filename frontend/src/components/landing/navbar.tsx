'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const links = [
  { href: '#platforma', label: 'Platforma' },
  { href: '#imkoniyatlar', label: 'Imkoniyatlar' },
  { href: '#natijalar', label: 'Natijalar' },
  { href: '#hamkorlar', label: 'Hamkorlar' },
  { href: '#aloqa', label: 'Aloqa' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-ink-200/80 bg-white/80 py-3 backdrop-blur-xl backdrop-saturate-150 shadow-soft'
          : 'bg-transparent py-5'
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 focus-visible:rounded-lg"
          aria-label="Edvantage bosh sahifa"
        >
          <Image src="/images/icon-dark.png" alt="Edvantage Logo" width={36} height={36} className="h-9 w-9 object-contain" />
          <span className="text-lg font-semibold tracking-tight text-ink">Edvantage</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Asosiy menyu">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] font-medium text-ink-secondary transition hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Kirish
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              Boshlash
            </Button>
          </Link>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Menyu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-ink-100 bg-white md:hidden"
          >
            <nav className="flex flex-col gap-1 p-4" aria-label="Mobil menyu">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-xl px-4 py-3 text-[15px] font-medium text-ink-secondary hover:bg-ink-50"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <Link href="/dashboard" className="mt-2">
                <Button variant="primary" className="w-full">
                  Platformaga kirish
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
