import { AppSidebar } from '@/components/layout/app-sidebar';
import { DashboardClientWrapper } from '@/components/layout/dashboard-client-wrapper';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] relative">
      <div className="pointer-events-none fixed inset-0 gradient-mesh" aria-hidden />
      <AppSidebar />
      <DashboardClientWrapper>
        {children}
      </DashboardClientWrapper>
    </div>
  );
}
