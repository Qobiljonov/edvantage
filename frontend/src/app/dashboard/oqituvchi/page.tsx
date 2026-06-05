'use client';

import { Users, FileQuestion, BarChart3, Download, AlertCircle } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { PageShell } from '@/components/shared/page-shell';
import { MetricTile } from '@/components/shared/metric-tile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { teacherClasses } from '@/lib/mock-data';

export default function OqituvchiPage() {
  return (
    <>
      <AppHeader title="O'qituvchi portali" subtitle="Sinf boshqaruvi va hisobotlar" />
      <PageShell>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile label="O'quvchilar" value={84} icon={Users} accent="blue" />
            <MetricTile label="Testlar" value={35} icon={FileQuestion} accent="teal" />
            <MetricTile label="O'rtacha ball" value="76%" icon={BarChart3} accent="gold" />
            <MetricTile label="Sinflar" value={3} icon={Users} accent="ink" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="primary" className="gap-2">
            <FileQuestion className="h-4 w-4" aria-hidden />
            Test yaratish
          </Button>
          <Button variant="secondary" className="gap-2">
            <Download className="h-4 w-4" aria-hidden />
            Hisobot
          </Button>
        </div>

        <Card className="mt-6 overflow-hidden">
          <CardHeader>
            <CardTitle>Sinflar</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/50 text-left text-2xs font-medium uppercase tracking-wider text-ink-tertiary">
                  <th className="px-6 py-4">Sinf</th>
                  <th className="px-6 py-4">O&apos;quvchilar</th>
                  <th className="px-6 py-4">Ball</th>
                  <th className="px-6 py-4">Testlar</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {teacherClasses.map((c) => (
                  <tr key={c.name} className="border-b border-ink-50 transition hover:bg-ink-50/50">
                    <td className="px-6 py-4 font-semibold text-ink">{c.name}</td>
                    <td className="px-6 py-4 tabular-nums text-ink-secondary">{c.students}</td>
                    <td className="px-6 py-4">
                      <Badge variant={c.avgScore >= 80 ? 'success' : 'warning'}>
                        {c.avgScore}%
                      </Badge>
                    </td>
                    <td className="px-6 py-4 tabular-nums text-ink-secondary">{c.tests}</td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm">
                        Batafsil
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="surface p-6">
            <h3 className="text-[15px] font-semibold text-ink">Eng yaxshilar</h3>
            <ul className="mt-4 space-y-2">
              {['Dilnoza R. — 95%', 'Jasur T. — 92%', 'Sardor K. — 87%'].map((s) => (
                <li
                  key={s}
                  className="flex justify-between rounded-xl surface-inset px-4 py-3 text-sm"
                >
                  <span className="text-ink">{s.split(' — ')[0]}</span>
                  <span className="font-semibold tabular-nums text-teal-600">
                    {s.split(' — ')[1]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="surface p-6">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <AlertCircle className="h-4 w-4 text-red-500" aria-hidden />
              Yordam kerak
            </h3>
            <ul className="mt-4 space-y-2">
              {['Aziz M. — Trigonometriya 45%', 'Nilufar Q. — Kimyo 52%'].map((s) => (
                <li key={s} className="flex justify-between rounded-xl bg-red-50 px-4 py-3 text-sm">
                  <span className="text-ink">{s.split(' — ')[0]}</span>
                  <span className="font-semibold tabular-nums text-red-600">
                    {s.split(' — ')[1]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageShell>
    </>
  );
}
