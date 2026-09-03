import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/finance-data";

type Totals = {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  budget: number;
};

export function SummaryCards({ totals, loading }: { totals: Totals; loading: boolean }) {
  const cards = [
    { label: "Current Balance", value: totals.balance, icon: Wallet, change: 8.2, good: true },
    { label: "Income", value: totals.income, icon: TrendingUp, change: 4.5, good: true },
    { label: "Expenses", value: totals.expenses, icon: TrendingDown, change: 12.8, good: false },
    { label: "Savings", value: totals.savings, icon: PiggyBank, change: 6.1, good: true },
    { label: "Monthly Budget", value: totals.budget, icon: Target, change: 0, good: true },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => (
          <Skeleton key={c.label} className="h-[132px] rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(({ label, value, icon: Icon, change, good }, i) => (
        <Card
          key={label}
          style={{ animationDelay: `${i * 60}ms` }}
          className="group animate-fade-in rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-[18px] w-[18px]" />
            </span>
          </div>
          <p className="font-display mt-4 text-2xl font-semibold tracking-tight">
            {formatINR(value)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {change === 0 ? (
              <span className="text-muted-foreground">On track this month</span>
            ) : (
              <>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium",
                    good ? "bg-success/12 text-success" : "bg-danger/12 text-danger",
                  )}
                >
                  {good ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {change}%
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
