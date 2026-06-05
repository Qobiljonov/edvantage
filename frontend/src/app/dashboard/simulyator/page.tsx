'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, CheckCircle2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { PageShell } from '@/components/shared/page-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const questions = [
  {
    id: 1,
    text: '2x + 5 = 15 tenglamaning yechimi:',
    options: ['x = 5', 'x = 10', 'x = 7', 'x = 3'],
    correct: 0,
  },
  { id: 2, text: '√144 ning qiymati:', options: ['10', '11', '12', '14'], correct: 2 },
  { id: 3, text: 'sin(90°) qiymati:', options: ['0', '0.5', '1', '−1'], correct: 2 },
];

export default function SimulyatorPage() {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [time, setTime] = useState(5400);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!started || finished || time <= 0) return;
    const t = setInterval(() => setTime((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [started, finished, time]);

  const fmt = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }, []);

  if (!started) {
    return (
      <>
        <AppHeader title="Imtihon simulyatori" subtitle="DTM · CBT · Haqiqiy vaqt" />
        <PageShell narrow className="flex min-h-[60vh] items-center">
          <div className="surface w-full p-8 text-center sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-950">
              <Clock className="h-8 w-8 text-white" aria-hidden />
            </div>
            <h2 className="mt-6 text-2xl font-semibold tracking-tight text-ink">
              DTM to&apos;liq simulyatsiya
            </h2>
            <p className="mt-2 text-sm text-ink-tertiary">
              90 savol · 90 daqiqa · Kompyuterli test formati
            </p>
            <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-ink-200 bg-ink-200">
              {[
                { v: '90', l: 'Savol' },
                { v: '90', l: 'Daqiqa' },
                { v: '4', l: 'Variant' },
              ].map((x) => (
                <div key={x.l} className="bg-white py-4">
                  <p className="text-xl font-semibold text-ink">{x.v}</p>
                  <p className="text-2xs text-ink-tertiary">{x.l}</p>
                </div>
              ))}
            </div>
            <Button
              variant="primary"
              size="lg"
              className="mt-8 w-full gap-2 sm:w-auto"
              onClick={() => setStarted(true)}
            >
              <Play className="h-4 w-4" aria-hidden />
              Boshlash
            </Button>
          </div>
        </PageShell>
      </>
    );
  }

  if (finished) {
    return (
      <>
        <AppHeader title="Natija" subtitle="Simulyatsiya yakunlandi" />
        <PageShell narrow className="flex min-h-[50vh] items-center">
          <div className="surface w-full p-8 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-teal-600" aria-hidden />
            <p className="mt-4 text-4xl font-semibold text-ink">78%</p>
            <p className="text-sm text-ink-tertiary">Taxminiy DTM ball</p>
            <Button
              variant="primary"
              className="mt-8"
              onClick={() => {
                setStarted(false);
                setFinished(false);
                setCurrent(0);
                setAnswers([]);
                setTime(5400);
              }}
            >
              Qayta boshlash
            </Button>
          </div>
        </PageShell>
      </>
    );
  }

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 border-b border-ink-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                Savol {current + 1}/{questions.length}
              </Badge>
              <Progress value={progress} className="hidden flex-1 sm:block" />
            </div>
          </div>
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 font-mono text-sm font-semibold tabular-nums ${
              time < 300 ? 'bg-red-50 text-red-700' : 'bg-ink-50 text-ink'
            }`}
            role="timer"
            aria-live="polite"
            aria-label={`Qolgan vaqt: ${fmt(time)}`}
          >
            <Clock className="h-4 w-4" aria-hidden />
            {fmt(time)}
          </div>
        </div>
      </div>

      <PageShell narrow>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="surface p-6 sm:p-8"
          >
            <p className="text-lg font-semibold leading-snug text-ink sm:text-xl">{q.text}</p>
            <div className="mt-8 space-y-3" role="radiogroup" aria-label="Javob variantlari">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  role="radio"
                  aria-checked={selected === i}
                  onClick={() => setSelected(i)}
                  className={`flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left transition ${
                    selected === i
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20'
                      : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50'
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-sm font-semibold text-ink">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-[15px] text-ink">{opt}</span>
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-between gap-3">
              <Button
                variant="secondary"
                disabled={current === 0}
                onClick={() => {
                  setCurrent(current - 1);
                  setSelected(answers[current - 1] ?? null);
                }}
              >
                Oldingi
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const next = [...answers];
                  next[current] = selected;
                  setAnswers(next);
                  if (current < questions.length - 1) {
                    setCurrent(current + 1);
                    setSelected(answers[current + 1] ?? null);
                  } else setFinished(true);
                }}
                disabled={selected === null}
              >
                {current === questions.length - 1 ? 'Yakunlash' : 'Keyingi'}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i);
                setSelected(answers[i] ?? null);
              }}
              aria-label={`Savol ${i + 1}`}
              className={`h-9 min-w-[2.25rem] rounded-lg text-xs font-medium tabular-nums transition ${
                i === current
                  ? 'bg-ink-950 text-white'
                  : answers[i] != null
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-ink-100 text-ink-tertiary'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </PageShell>
    </div>
  );
}
