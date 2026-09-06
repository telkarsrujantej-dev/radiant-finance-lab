import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Repeat,
  BarChart3,
  CalendarDays,
  Sparkles,
  Bot,
  Settings,
  Users,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/members.functions";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { label: "Transactions", icon: ArrowLeftRight, to: "/transactions" },
  { label: "Budgets", icon: Wallet, to: "/budgets" },
  { label: "Savings", icon: PiggyBank, to: "/savings" },
  { label: "Recurring", icon: Repeat, to: "/recurring" },
  { label: "Analytics", icon: BarChart3, to: "/analytics" },
  { label: "Calendar", icon: CalendarDays, to: "/calendar" },
  { label: "AI Insights", icon: Sparkles, to: "/ai-insights" },
  { label: "AI Assistant", icon: Bot, to: "/ai-assistant" },
  { label: "Settings", icon: Settings, to: "/settings" },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-3">
      {navItems.map(({ label, icon: Icon, to }) => (
        <Link
          key={label}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
          activeProps={{
            className:
              "bg-primary text-primary-foreground shadow-[var(--shadow-soft)] hover:bg-primary hover:text-primary-foreground",
          }}
        >
          <Icon className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("finance-theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("finance-theme", next ? "dark" : "light");
  };

  return (
    <Button
      variant="outline"
      onClick={toggle}
      className="w-full justify-start gap-3 rounded-xl border-border/70"
    >
      {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      <span className="text-sm">{dark ? "Light mode" : "Dark mode"}</span>
    </Button>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-6 py-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
        <Wallet className="h-[18px] w-[18px]" />
      </div>
      <div className="leading-tight">
        <p className="font-display text-base font-semibold tracking-tight">Finance Tracker</p>
        <p className="text-xs text-muted-foreground">Smart money, simplified</p>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/60 bg-sidebar lg:flex">
        <Brand />
        <NavList />
        <div className="p-3">
          <ThemeToggle />
        </div>
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Wallet className="h-4 w-4" />
          </div>
          <span className="font-display text-sm font-semibold">Finance Tracker</span>
        </div>
        <Button variant="ghost" size="icon" aria-label="Open menu" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border/60 bg-sidebar animate-slide-in-left">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
            <div className="p-3">
              <ThemeToggle />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
