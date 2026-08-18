import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { NotificationBell } from "@/components/layout/NotificationBell";

export function PageShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
              <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {actions}
              <NotificationBell />
            </div>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
