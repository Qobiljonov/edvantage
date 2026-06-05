'use client';

import { Upload, FileText, Layers, Database, Search, Brain, MessageSquare } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { PageShell } from '@/components/shared/page-shell';
import { FlowStep } from '@/components/motion/flow-step';
import { Reveal } from '@/components/motion/reveal';
import { AnimatedCounter } from '@/components/motion/animated-counter';
import { MotionButton } from '@/components/motion/motion-button';
import Link from 'next/link';

const steps = [
  { title: 'PDF yuklash', desc: "Darslik va qo'llanmalar xavfsiz yuklanadi", icon: Upload },
  { title: 'Matn ajratish', desc: 'OCR va strukturaviy matn chiqarish', icon: FileText },
  { title: 'Bilimni qayta ishlash', desc: 'Mavzular va formulalar ajratiladi', icon: Layers },
  { title: "Vektor ma'lumotlar bazasi", desc: 'Embeddinglar saqlanadi', icon: Database },
  { title: 'Semantik qidiruv', desc: "Eng yaqin bilim bo'laklari topiladi", icon: Search },
  { title: 'AI mantiqiy tahlil', desc: 'Kontekst sintezi va xulosa', icon: Brain },
  { title: "O'zbek tilida javob", desc: 'Professional javob generatsiyasi', icon: MessageSquare },
];

export default function BilimDvigateliPage() {
  return (
    <>
      <AppHeader title="Bilim dvigateli" subtitle="Edvantage AI qanday ishlaydi" />
      <PageShell>
        <Reveal>
          <p className="text-center text-sm text-ink-secondary">
            Kitobdan javobgacha — 7 bosqichli milliy zanjir
          </p>
        </Reveal>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Reveal delay={0} className="surface p-5 text-center">
            <p className="label-caps">Yuklangan kitoblar</p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              <AnimatedCounter value={1247} />
            </p>
          </Reveal>
          <Reveal delay={1} className="surface p-5 text-center">
            <p className="label-caps">Bilim bo&apos;laklari</p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              <AnimatedCounter value={2.4} decimals={1} suffix="M" />
            </p>
          </Reveal>
          <Reveal delay={2} className="surface p-5 text-center">
            <p className="label-caps">AI javoblar</p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              <AnimatedCounter value={89420} />
            </p>
          </Reveal>
          <Reveal delay={3} className="surface p-5 text-center">
            <p className="label-caps">Qidiruv tezligi</p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              <AnimatedCounter value={48} suffix=" ms" />
            </p>
          </Reveal>
        </div>

        <Reveal className="mt-10">
          <h2 className="text-center text-lg font-semibold text-ink">Ishlash zanjiri</h2>
          <p className="mt-1 text-center text-2xs text-ink-tertiary">
            Scroll qiling — bosqichlar ketma-ket paydo bo&apos;ladi
          </p>
        </Reveal>

        <div className="mx-auto mt-8 flex max-w-md flex-col items-center">
          {steps.map((s, i) => (
            <FlowStep
              key={s.title}
              step={i + 1}
              title={s.title}
              description={s.desc}
              icon={<s.icon className="h-5 w-5" strokeWidth={1.75} />}
              index={i}
            />
          ))}
        </div>

        <Reveal className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard/kutubxona">
            <MotionButton variant="primary">Kutubxonaga o&apos;tish</MotionButton>
          </Link>
          <Link href="/dashboard/ai-ustoz">
            <MotionButton variant="secondary">AI Ustoz</MotionButton>
          </Link>
        </Reveal>
      </PageShell>
    </>
  );
}
