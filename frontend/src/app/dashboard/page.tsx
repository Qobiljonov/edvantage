'use client';

import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BookOpen, CheckCircle, TrendingUp, Trophy, Flame, Brain, ArrowRight } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { PageShell } from '@/components/shared/page-shell';
import { MetricTile } from '@/components/shared/metric-tile';
import { ChartCard } from '@/components/shared/chart-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { AnimatedChart } from '@/components/motion/animated-chart';
import { MotionButton } from '@/components/motion/motion-button';
import { CHART } from '@/lib/chart-theme';
import {
  student,
  weeklyProgress,
  topicsLearned,
  completedTests,
  aiRecommendations,
} from '@/lib/mock-data';

export default function DashboardPage() {
  const firstName = student.name.split(' ')[0];

  return (
    <>
      <AppHeader
        title={`Salom, ${firstName}`}
        subtitle={`${student.school} · ${student.grade}`}
        actions={
          <Link href="/dashboard/ai-ustoz" className="hidden sm:block">
            <MotionButton variant="primary" size="sm">
              AI Ustoz
            </MotionButton>
          </Link>
        }
      />
      <PageShell>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile
            label="O'rganilgan mavzular"
            value={topicsLearned.length}
            trend={{ value: '+2 bu hafta', up: true }}
            icon={BookOpen}
            accent="blue"
          />
          <MetricTile
            label="Yakunlangan testlar"
            value={completedTests.length}
            trend={{ value: '+3 bu hafta', up: true }}
            icon={CheckCircle}
            accent="teal"
          />
          <MetricTile
            label="DTM tayyorligi"
            value={`${student.readiness}%`}
            hint="Milliy benchmark"
            icon={TrendingUp}
            accent="gold"
          />
          <MetricTile
            label="Respublika reytingi"
            value={`#${student.rank.national}`}
            hint={`Hudud: #${student.rank.region}`}
            icon={Trophy}
            accent="ink"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <ChartCard
            title="Haftalik progress"
            subtitle="O'rtacha ball — oxirgi 7 kun"
            className="lg:col-span-8"
          >
            <AnimatedChart>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={weeklyProgress}>
                  <defs>
                    <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.primary} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={CHART.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="4 4" vertical={false} />
                  <XAxis
                    dataKey="kun"
                    tick={{ fill: CHART.axis, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: CHART.axis, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[50, 100]}
                  />
                  <Tooltip contentStyle={CHART.tooltip} labelStyle={{ color: '#94a3b8' }} />
                  <Area
                    type="monotone"
                    dataKey="ball"
                    stroke={CHART.primary}
                    strokeWidth={2}
                    fill="url(#progressFill)"
                    dot={false}
                    activeDot={{ r: 4, fill: CHART.primary }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </AnimatedChart>
          </ChartCard>

          <Card className="lg:col-span-4">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>O&apos;qish seriyasi</CardTitle>
                <p className="text-2xs text-ink-tertiary">Ketma-ket faol kunlar</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400/15">
                <Flame className="h-5 w-5 text-gold-600" aria-hidden />
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-5xl font-semibold tracking-tight text-ink tabular-nums">
                {student.streak}
              </p>
              <p className="mt-1 text-2xs text-ink-tertiary">kun</p>
              <div
                className="mt-6 flex justify-center gap-1.5"
                role="img"
                aria-label="Haftalik faollik"
              >
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-9 w-9 rounded-lg transition ${i < 5 ? 'bg-brand-600' : 'bg-ink-100'}`}
                  />
                ))}
              </div>
              <p className="mt-4 text-2xs text-ink-tertiary">Rekord: 30 kun · +50 XP/kun</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Mavzular</CardTitle>
              <p className="text-2xs text-ink-tertiary">O&apos;rganish jarayoni</p>
            </CardHeader>
            <CardContent className="space-y-5">
              {topicsLearned.map((t) => (
                <div key={t.name}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium text-ink">{t.name}</p>
                    <span className="shrink-0 text-2xs font-medium tabular-nums text-ink-tertiary">
                      {t.progress}%
                    </span>
                  </div>
                  <Progress value={t.progress} className="mt-2" />
                  <Badge variant="outline" className="mt-2">
                    {t.subject}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>So&apos;nggi testlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {completedTests.map((t) => (
                <div
                  key={t.name}
                  className="flex items-center justify-between gap-4 rounded-xl surface-inset px-4 py-3 transition hover:bg-ink-100"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{t.name}</p>
                    <p className="text-2xs text-ink-tertiary">
                      {t.date} · {t.questions} savol
                    </p>
                  </div>
                  <Badge variant={t.score >= 80 ? 'success' : 'warning'}>{t.score}%</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Reveal className="mt-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                  <Brain className="h-5 w-5 text-brand-600" strokeWidth={1.75} aria-hidden />
                </div>
                <div>
                  <CardTitle>AI tavsiyalari</CardTitle>
                  <p className="text-2xs text-ink-tertiary">Bugun uchun ustuvor</p>
                </div>
              </div>
              <Link href="/dashboard/ai-ustoz">
                <Button variant="ghost" size="sm" className="gap-1">
                  Barchasi <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {aiRecommendations.map((r) => (
                <div
                  key={r.title}
                  className="rounded-xl border border-ink-100 p-5 transition hover:border-brand-200 hover:shadow-soft"
                >
                  <Badge
                    variant={
                      r.priority === 'yuqori'
                        ? 'danger'
                        : r.priority === "o'rta"
                          ? 'warning'
                          : 'outline'
                    }
                  >
                    {r.priority === 'yuqori' ? 'Muhim' : r.priority === "o'rta" ? "O'rta" : 'Past'}
                  </Badge>
                  <p className="mt-3 text-sm font-semibold text-ink">{r.title}</p>
                  <p className="mt-1.5 text-2xs leading-relaxed text-ink-secondary">{r.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </Reveal>
      </PageShell>
    </>
  );
}
