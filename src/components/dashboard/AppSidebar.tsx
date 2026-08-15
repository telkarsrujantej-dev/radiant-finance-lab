import { useState } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  BarChart3,
  Sparkles,
  Bot,
  Settings,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Transactions", icon: ArrowLeftRight },
  { label: "Income", icon: TrendingUp },
  { label: "Expenses", icon: TrendingDown },
  { label: "Budgets", icon: Wallet },
  { label: "Savings", icon: PiggyBank },
  { label: "Analytics", icon: BarChart3 },
  { label: "AI Insights", icon: Sparkles },
  { label: "AI Assistant", icon: Bot },
  { label: "Settings", icon: Settings },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {navItems.map(({ label, icon: Icon }) => {
        const active = label === "Dashboard";
        return (
          <button
            key={label}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
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
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/60 bg-sidebar lg:flex">
        <Brand />
        <NavList />
        <div className="p-3">
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile top bar */}
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

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border/60 bg-sidebar animate-slide-in-left">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setOpen(false)}>
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
