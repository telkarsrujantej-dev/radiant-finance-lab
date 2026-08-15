import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/lib/finance-data";

export function BudgetProgress({
  spent,
  budget,
  loading,
}: {
  spent: number;
  budget: number;
  loading: boolean;
}) {
  const pct = Math.min(100, Math.round((spent / budget) * 100));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setWidth(pct), 150);
    return () => clearTimeout(id);
  }, [pct]);

  if (loading) return <Skeleton className="h-[180px] rounded-2xl" />;

  const remaining = Math.max(0, budget - spent);

  return (
    <Card className="animate-fade-in rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight">Monthly Budget</h2>
        <span className="text-sm text-muted-foreground">{pct}% used</span>
      </div>
      <p className="font-display mt-3 text-2xl font-semibold tracking-tight">
        {formatINR(spent)}
        <span className="text-base font-normal text-muted-foreground"> / {formatINR(budget)}</span>
      </p>
      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[image:var(--gradient-primary)] transition-[width] duration-1000 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{formatINR(remaining)}</span> remaining this month
      </p>
    </Card>
  );
}
