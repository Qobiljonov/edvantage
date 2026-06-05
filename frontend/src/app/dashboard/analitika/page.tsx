'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  LineChart,
  Line,
} from 'recharts';
import { AppHeader } from '@/components/layout/app-header';
import { PageShell } from '@/components/shared/page-shell';
import { MetricTile } from '@/components/shared/metric-tile';
import { ChartCard } from '@/components/shared/chart-card';
import { Progress } from '@/components/ui/progress';
import { CHART } from '@/lib/chart-theme';
import { strongTopics, weakTopics, weeklyProgress, student } from '@/lib/mock-data';
import { TrendingUp, Target, BarChart3, FileCheck } from 'lucide-react';
import { AnimatedChart } from '@/components/motion/animated-chart';

const radarData = [
  { subject: 'Algebra', A: 92 },
  { subject: 'Geometriya', A: 85 },
  { subject: 'Fizika', A: 72 },
  { subject: 'Kimyo', A: 65 },
  { subject: 'Biologiya', A: 58 },
  { subject: 'Ona tili', A: 88 },
];

const barData = [...strongTopics, ...weakTopics];

export default function AnalitikaPage() {
  return (
    <>
      <AppHeader title="Analitika markazi" subtitle="DTM tayyorligi — shaxsiy tahlil" />
      <PageShell>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile
            label="Tayyorlik"
            value={`${student.readiness}%`}
            icon={Target}
            accent="blue"
          />
          <MetricTile
            label="O'rtacha ball"
            value="82%"
            trend={{ value: '+5% oylik', up: true }}
            icon={TrendingUp}
            accent="teal"
          />
          <MetricTile label="Haftalik o'sish" value="+12%" icon={BarChart3} accent="gold" />
          <MetricTile
            label="Testlar"
            value="47"
            hint="Jami yechilgan"
            icon={FileCheck}
            accent="ink"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="surface p-6">
            <h3 className="text-[15px] font-semibold text-ink">Kuchli mavzular</h3>
            <div className="mt-5 space-y-5">
              {strongTopics.map((t) => (
                <div key={t.name}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-ink">{t.name}</span>
                    <span className="tabular-nums text-teal-600">{t.percent}%</span>
                  </div>
                  <Progress value={t.percent} className="mt-2" indicatorClassName="bg-teal-600" />
                </div>
              ))}
            </div>
          </div>
          <div className="surface p-6">
            <h3 className="text-[15px] font-semibold text-ink">Zaif mavzular</h3>
            <div className="mt-5 space-y-5">
              {weakTopics.map((t) => (
                <div key={t.name}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-ink">{t.name}</span>
                    <span className="tabular-nums text-red-600">{t.percent}%</span>
                  </div>
                  <Progress value={t.percent} className="mt-2" indicatorClassName="bg-red-500" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ChartCard title="Haftalik dinamika" subtitle="Ball o'zgarishi">
            <AnimatedChart>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={weeklyProgress}>
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
                  <Tooltip contentStyle={CHART.tooltip} />
                  <Line
                    type="monotone"
                    dataKey="ball"
                    stroke={CHART.primary}
                    strokeWidth={2}
                    dot={{ r: 3, fill: CHART.primary }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </AnimatedChart>
          </ChartCard>
          <ChartCard title="Fanlar profili" subtitle="Radar tahlil">
            <AnimatedChart>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={CHART.grid} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: CHART.axis, fontSize: 11 }} />
                  <Radar
                    dataKey="A"
                    stroke={CHART.primary}
                    fill={CHART.primary}
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </AnimatedChart>
          </ChartCard>
        </div>

        <ChartCard title="Barcha mavzular" subtitle="Foiz bo'yicha" className="mt-6">
          <AnimatedChart>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} barSize={32}>
                <CartesianGrid stroke={CHART.grid} strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: CHART.axis, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: CHART.axis, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={CHART.tooltip} />
                <Bar dataKey="percent" fill={CHART.primary} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </AnimatedChart>
        </ChartCard>
      </PageShell>
    </>
  );
}
