'use client';

import { usePathname } from 'next/navigation';
import { AiCoachPanel } from '@/components/chat/ai-coach-panel';
import Link from 'next/link';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAiUstozPage = pathname === '/dashboard/ai-ustoz';

  return (
    <>
      {/* Main Content Area */}
      <div className={cn("relative flex min-h-screen lg:pl-[260px]", isAiUstozPage ? "xl:pr-0" : "xl:pr-[380px]")}>
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
      
      {/* Mobile/Tablet Floating Chat Button (hide on ai-ustoz page) */}
      {!isAiUstozPage && (
        <Link 
          href="/dashboard/ai-ustoz"
          className="xl:hidden fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl hover:bg-brand-500 hover:scale-110 transition-all duration-300"
          aria-label="AI Ustoz bilan suhbat"
        >
          <Bot className="h-6 w-6" />
        </Link>
      )}

      {/* Right AI Coach Panel (hide on ai-ustoz page) */}
      {!isAiUstozPage && (
        <aside className="hidden xl:block fixed top-0 right-0 z-30 h-screen w-[380px] p-4">
          <AiCoachPanel />
        </aside>
      )}
    </>
  );
}
