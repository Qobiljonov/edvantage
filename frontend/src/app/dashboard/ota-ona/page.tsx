'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, CheckCircle, TrendingUp, Flame, Brain } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { PageShell } from '@/components/shared/page-shell';
import { MetricTile } from '@/components/shared/metric-tile';
import { ChartCard } from '@/components/shared/chart-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHART } from '@/lib/chart-theme';
import { parentStats, completedTests, aiRecommendations, student } from '@/lib/mock-data';

const activity = [
  { kun: 'Du', daqiqa: 45 },
  { kun: 'Se', daqiqa: 60 },
  { kun: 'Ch', daqiqa: 30 },
  { kun: 'Pa', daqiqa: 90 },
  { kun: 'Ju', daqiqa: 55 },
  { kun: 'Sh', daqiqa: 120 },
  { kun: 'Ya', daqiqa: 75 },
];

export default function OtaOnaPage() {
  return (
    <>
      <AppHeader title="Ota-ona portali" subtitle={`${student.name} — monitoring va tavsiyalar`} />
      <PageShell>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile
            label="Haftalik o'qish"
            value={`${parentStats.weeklyHours} soat`}
            icon={Clock}
            accent="blue"
          />
          <MetricTile
            label="Testlar"
            value={parentStats.testsCompleted}
            icon={CheckCircle}
            accent="teal"
          />
          <MetricTile
            label="O'rtacha ball"
            value={`${parentStats.avgScore}%`}
            icon={TrendingUp}
            accent="gold"
          />
          <MetricTile
            label="Seriya"
            value={`${parentStats.streak} kun`}
            icon={Flame}
            accent="ink"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ChartCard title="Haftalik faollik" subtitle="Daqiqalar">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={activity}>
                <defs>
                  <linearGradient id="parentAct" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART.secondary} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={CHART.secondary} stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                />
                <Tooltip contentStyle={CHART.tooltip} />
                <Area
                  type="monotone"
                  dataKey="daqiqa"
                  stroke={CHART.secondary}
                  fill="url(#parentAct)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <Card>
            <CardHeader>
              <CardTitle>So&apos;nggi natijalar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {completedTests.slice(0, 4).map((t) => (
                <div
                  key={t.name}
                  className="flex items-center justify-between gap-4 rounded-xl surface-inset px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{t.name}</p>
                    <p className="text-2xs text-ink-tertiary">{t.date}</p>
                  </div>
                  <Badge variant={t.score >= 80 ? 'success' : 'warning'}>{t.score}%</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader className="flex-row items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
              <Brain className="h-5 w-5 text-brand-600" aria-hidden />
            </div>
            <div>
              <CardTitle>AI tavsiyalari</CardTitle>
              <p className="text-2xs text-ink-tertiary">Farzandingiz uchun</p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {aiRecommendations.map((r) => (
              <div key={r.title} className="rounded-xl border border-ink-100 p-5">
                <p className="text-sm font-semibold text-ink">{r.title}</p>
                <p className="mt-2 text-2xs leading-relaxed text-ink-secondary">{r.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-2xs text-ink-tertiary">
          Oxirgi faollik: {parentStats.lastActivity}
        </p>
      </PageShell>
    </>
  );
}
