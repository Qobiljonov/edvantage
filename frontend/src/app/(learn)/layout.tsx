import { LearnProvider } from '@/lib/learn/store';
import { AppShell } from '@/components/learn/app-shell';

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <LearnProvider>
      <AppShell>{children}</AppShell>
    </LearnProvider>
  );
}
