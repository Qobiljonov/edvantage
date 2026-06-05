'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Hash } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { PageShell } from '@/components/shared/page-shell';
import { MetricTile } from '@/components/shared/metric-tile';
import { RankRow } from '@/components/motion/rank-row';
import { Badge } from '@/components/ui/badge';
import { rankings, student } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'school', label: 'Maktab' },
  { id: 'class', label: 'Sinf' },
  { id: 'region', label: 'Hudud' },
  { id: 'national', label: 'Respublika' },
] as const;

export default function ReytingPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('school');
  const list = tab === 'region' ? rankings.region : rankings.school;

  return (
    <>
      <AppHeader title="Reyting tizimi" subtitle="Shaffof raqobat — milliy miqyos" />
      <PageShell>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile
            label="Maktab"
            value={`#${student.rank.school}`}
            icon={Trophy}
            accent="gold"
          />
          <MetricTile label="Hudud" value={`#${student.rank.region}`} icon={Medal} accent="blue" />
          <MetricTile
            label="Respublika"
            value={`#${student.rank.national}`}
            icon={Crown}
            accent="teal"
          />
          <MetricTile
            label="Jami XP"
            value={student.xp.toLocaleString('uz-UZ')}
            icon={Hash}
            accent="ink"
          />
        </div>

        <div
          className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          role="tablist"
          aria-label="Reyting turi"
        >
          {tabs.map((t) => (
            <motion.button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition',
                tab === t.id
                  ? 'bg-ink-950 text-white'
                  : 'bg-white text-ink-secondary ring-1 ring-ink-200 hover:bg-ink-50'
              )}
            >
              {t.label}
            </motion.button>
          ))}
        </div>

        <div className="mt-6 surface overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="divide-y divide-ink-100"
            >
              {list.map((item, i) => (
                <RankRow
                  key={`${tab}-${item.rank}-${item.name}`}
                  index={i}
                  rank={item.rank}
                  highlight={'isMe' in item && item.isMe}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-950 text-xs font-bold text-white">
                    {item.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{item.name}</p>
                    {'isMe' in item && item.isMe && (
                      <Badge variant="success" className="mt-1">
                        Siz
                      </Badge>
                    )}
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                    {item.score.toLocaleString('uz-UZ')} XP
                  </p>
                </RankRow>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </PageShell>
    </>
  );
}
