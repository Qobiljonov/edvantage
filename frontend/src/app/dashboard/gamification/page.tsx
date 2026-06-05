'use client';

import { Flame, Zap, Award, Star } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { PageShell } from '@/components/shared/page-shell';
import { Progress } from '@/components/ui/progress';
import { FadeUp } from '@/components/shared/motion';
import { student, achievements } from '@/lib/mock-data';

const challenges = [
  { icon: Zap, title: 'Kunlik vazifa', desc: '3 ta test yeching', xp: '+100 XP' },
  { icon: Award, title: 'Haftalik chellenj', desc: '5 ta yangi mavzu', xp: '+500 XP' },
  { icon: Flame, title: 'Seriya bonusi', desc: '7 kun ketma-ket', xp: '+200 XP' },
];

export default function GamificationPage() {
  const nextLevelXp = 15000;
  const levelProgress = (student.xp / nextLevelXp) * 100;

  return (
    <>
      <AppHeader title="Yutuqlar" subtitle="XP · Daraja · Medallar" />
      <PageShell>
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white lg:col-span-5">
            <Flame className="h-10 w-10 opacity-90" strokeWidth={1.5} aria-hidden />
            <p className="mt-6 text-6xl font-semibold tracking-tight tabular-nums">
              {student.streak}
            </p>
            <p className="mt-1 text-sm text-white/80">kunlik seriya</p>
            <p className="mt-6 text-2xs text-white/60">Rekord: 30 kun</p>
          </div>
          <div className="surface p-8 lg:col-span-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="label-caps">Joriy daraja</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">
                  {student.level}
                </p>
                <p className="mt-1 text-sm text-ink-tertiary">
                  {student.xp.toLocaleString('uz-UZ')} XP
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-950 text-2xl font-bold text-white">
                {student.level}
              </div>
            </div>
            <Progress value={levelProgress} className="mt-8 h-2" />
            <p className="mt-3 text-2xs text-ink-tertiary">
              Keyingi daraja: {(nextLevelXp - student.xp).toLocaleString('uz-UZ')} XP
            </p>
          </div>
        </div>

        <h2 className="mt-10 text-[15px] font-semibold text-ink">Medallar</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {achievements.map((a, i) => (
            <FadeUp key={a.name} delay={i * 0.04}>
              <div
                className={`surface flex flex-col items-center p-5 text-center ${
                  !a.unlocked && 'opacity-45 grayscale'
                }`}
              >
                <span className="text-3xl" role="img" aria-label={a.name}>
                  {a.icon}
                </span>
                <p className="mt-3 text-xs font-semibold text-ink">{a.name}</p>
                {a.unlocked && (
                  <Star className="mt-2 h-4 w-4 fill-gold-400 text-gold-400" aria-hidden />
                )}
              </div>
            </FadeUp>
          ))}
        </div>

        <h2 className="mt-10 text-[15px] font-semibold text-ink">Chellenjlar</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {challenges.map((c) => (
            <div key={c.title} className="surface p-5 transition hover:shadow-soft">
              <c.icon className="h-5 w-5 text-brand-600" strokeWidth={1.75} aria-hidden />
              <p className="mt-3 font-semibold text-ink">{c.title}</p>
              <p className="mt-1 text-2xs text-ink-tertiary">{c.desc}</p>
              <p className="mt-3 text-xs font-semibold text-teal-600">{c.xp}</p>
            </div>
          ))}
        </div>
      </PageShell>
    </>
  );
}
