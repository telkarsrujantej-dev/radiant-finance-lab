import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, CircleDollarSign } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/lib/finance-store";
import { SEED_YEAR, MONTH_NAMES, formatDate, formatINR, monthPeriod } from "@/lib/finance-data";
import { byPeriod } from "@/lib/finance-selectors";
import { cn } from "@/lib/utils";

const title = "Financial Calendar — Finance Tracker";
const description = "See income and expenses laid out across your local financial calendar.";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { state } = useFinance();
  const [monthIndex, setMonthIndex] = useState(7);
  const period = monthPeriod(SEED_YEAR, monthIndex);
  const transactions = useMemo(
    () => byPeriod(state.transactions, period),
    [state.transactions, period],
  );
  const byDay = useMemo(() => {
    const map = new Map<number, typeof transactions>();
    transactions.forEach((transaction) => {
      const day = Number(transaction.date.slice(8, 10));
      map.set(day, [...(map.get(day) ?? []), transaction]);
    });
    return map;
  }, [transactions]);
  const days = new Date(SEED_YEAR, monthIndex + 1, 0).getDate();
  const offset = new Date(SEED_YEAR, monthIndex, 1).getDay();
  const cells = Array.from({ length: offset + days }, (_, index) =>
    index < offset ? null : index - offset + 1,
  );

  return (
    <PageShell subtitle="A clear view of your month" title="Financial Calendar">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card className="rounded-2xl border-border/60 p-4 shadow-[var(--shadow-soft)] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous month"
              className="rounded-xl"
              disabled={monthIndex === 0}
              onClick={() => setMonthIndex((value) => Math.max(0, value - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                {MONTH_NAMES[monthIndex]} {SEED_YEAR}
              </h2>
              <p className="text-sm text-muted-foreground">{transactions.length} transactions</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next month"
              className="rounded-xl"
              disabled={monthIndex === 11}
              onClick={() => setMonthIndex((value) => Math.min(11, value + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground sm:gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day} className="py-2">
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {cells.map((day, index) => {
              const items = day ? (byDay.get(day) ?? []) : [];
              const hasIncome = items.some((item) => item.kind === "income");
              const hasExpense = items.some((item) => item.kind === "expense");
              return (
                <div
                  key={`${day ?? "empty"}-${index}`}
                  className={cn(
                    "min-h-16 rounded-xl border border-transparent p-1.5 text-left sm:min-h-24 sm:p-2",
                    day && "bg-muted/50",
                    items.length > 0 && "border-border/60",
                  )}
                >
                  <span className={cn("text-xs font-medium", day && "text-foreground")}>{day}</span>
                  {items.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {hasIncome && <span className="block h-1.5 rounded-full bg-success" />}
                      {hasExpense && <span className="block h-1.5 rounded-full bg-danger" />}
                      <span className="hidden text-[10px] text-muted-foreground sm:block">
                        {items.length} {items.length === 1 ? "entry" : "entries"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" />
              Income
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-danger" />
              Expense
            </span>
          </div>
        </Card>
        <Card className="rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
              <CircleDollarSign className="h-[18px] w-[18px]" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Month at a glance
              </h2>
              <p className="text-sm text-muted-foreground">{MONTH_NAMES[monthIndex]} activity</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <Summary
              label="Income"
              value={transactions
                .filter((t) => t.kind === "income")
                .reduce((sum, t) => sum + t.amount, 0)}
              tone="text-success"
            />
            <Summary
              label="Expenses"
              value={transactions
                .filter((t) => t.kind === "expense")
                .reduce((sum, t) => sum + t.amount, 0)}
              tone="text-danger"
            />
          </div>
          <div className="mt-6 border-t border-border/60 pt-5">
            <h3 className="font-display text-sm font-semibold">Latest entries</h3>
            <div className="mt-3 space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{transaction.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-medium",
                      transaction.kind === "income" ? "text-success" : "text-danger",
                    )}
                  >
                    {transaction.kind === "income" ? "+" : "−"}
                    {formatINR(transaction.amount)}
                  </span>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-sm text-muted-foreground">No entries in this month.</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

function Summary({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("font-display text-lg font-semibold", tone)}>{formatINR(value)}</span>
    </div>
  );
}
