import { useState } from "react";
import { HeartPulse } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { HealthScore } from "@/lib/finance-selectors";

function Ring({ score }: { score: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[120px] w-[120px]">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-muted)" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * score) / 100}
          style={{ transition: "stroke-dashoffset 900ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-semibold tracking-tight">{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

export function FinancialHealthCard({
  health,
  loading,
}: {
  health: HealthScore;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (loading) return <Skeleton className="h-[320px] rounded-2xl" />;

  return (
    <Card className="animate-fade-in rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-foreground">
          <HeartPulse className="h-[18px] w-[18px]" />
        </span>
        <h2 className="font-display text-lg font-semibold tracking-tight">Financial Health</h2>
      </div>

      <div className="mt-4 flex items-center gap-5">
        <Ring score={health.score} />
        <div>
          <p className="font-display text-xl font-semibold tracking-tight">{health.label}</p>
          <p className="mt-1 text-sm text-muted-foreground">Based on budget, savings and trend</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Meter label="Budget Usage" value={health.budgetUsage} />
        <Meter label="Savings Rate" value={health.savingsRate} />
        <Meter label="Spending Control" value={health.spendingControl} />
      </div>

      <Button variant="outline" className="mt-5 w-full rounded-xl" onClick={() => setOpen(true)}>
        View Details
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="font-display">Financial Health Details</DialogTitle>
            <DialogDescription>How your score of {health.score} is calculated.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="space-y-3">
              <Meter label="Budget Usage" value={health.budgetUsage} />
              <p className="text-xs text-muted-foreground">
                Share of your monthly budget spent in the selected period. Lower is better.
              </p>
              <Meter label="Savings Rate" value={health.savingsRate} />
              <p className="text-xs text-muted-foreground">
                Portion of income kept after expenses in this period.
              </p>
              <Meter label="Spending Control" value={health.spendingControl} />
              <p className="text-xs text-muted-foreground">
                Compares this period's spending with the previous period.
              </p>
            </div>
            <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
              Score = 35% budget usage + 40% savings rate + 25% spending control. All values are
              calculated locally from your transactions.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
