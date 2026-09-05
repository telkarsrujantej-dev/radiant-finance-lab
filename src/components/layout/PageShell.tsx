import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, UserCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

function AccountMenu() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setEmail(data.user?.email ?? null);
    });
    return () => {
      active = false;
    };
  }, []);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  };

  if (!email) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 gap-2 rounded-xl border-border/70 px-3">
          <UserCircle className="h-[18px] w-[18px]" />
          <span className="hidden max-w-[150px] truncate text-sm sm:inline">{email}</span>
          <span className="sr-only">Open account menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
        <DropdownMenuLabel className="font-display">Your account</DropdownMenuLabel>
        <p className="truncate px-2 pb-2 text-xs text-muted-foreground">{email}</p>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
                <AccountMenu />
              </div>
            </header>
            {children}
          </div>
        </main>
      </div>
  );
}
