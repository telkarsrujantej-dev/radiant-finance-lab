import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, BarChart3, CalendarRange, ReceiptText } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { PeriodFilter } from "@/components/finance/PeriodFilter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/lib/finance-store";
import { periodFromPreset, type Period } from "@/lib/finance-data";
import { statistics, trendSeries, comparisonByCategory } from "@/lib/finance-selectors";
import { formatINR } from "@/lib/finance-data";

const title = "Analytics — Finance Tracker";
const description =
  "Compare local income, expenses, categories and savings trends across any period.";

export const Route = createFileRoute("/analytics")({
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
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { state } = useFinance();
  const [period, setPeriod] = useState<Period>(() => periodFromPreset("this-year"));
  const [grain, setGrain] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const stats = useMemo(() => statistics(state.transactions, period), [state.transactions, period]);
  const trend = useMemo(
    () => trendSeries(state.transactions, period, grain),
    [state.transactions, period, grain],
  );
  const comparison = useMemo(
    () => comparisonByCategory(state.transactions, period),
    [state.transactions, period],
  );

  return (
    <PageShell
      subtitle="Understand your patterns"
      title="Analytics"
      actions={<PeriodFilter period={period} onChange={setPeriod} />}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={CalendarRange} label="Average daily spend" value={formatINR(stats.avgDaily)} />
        <Stat
          icon={BarChart3}
          label="Top category"
          value={stats.topCategory}
          detail={formatINR(stats.topCategoryValue)}
        />
        <Stat
          icon={ReceiptText}
          label="Transactions"
          value={String(stats.transactionCount)}
          detail="in selected period"
        />
        <Stat
          icon={ArrowUpRight}
          label="Savings rate"
          value={`${stats.savingsRate}%`}
          detail="income kept"
        />
      </div>

      <Card className="rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">Cash flow trend</h2>
            <p className="text-sm text-muted-foreground">
              Switch the view to compare spending over time.
            </p>
          </div>
          <div className="flex flex-wrap gap-1 rounded-xl bg-muted p-1">
            {(["daily", "weekly", "monthly", "yearly"] as const).map((value) => (
              <Button
                key={value}
                type="button"
                variant={grain === value ? "secondary" : "ghost"}
                size="sm"
                className="rounded-lg capitalize"
                onClick={() => setGrain(value)}
              >
                {value}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-6 h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsExpenseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-danger)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--color-danger)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={64}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                tickFormatter={(value) =>
                  `₹${value >= 1000 ? `${Math.round(value / 1000)}k` : value}`
                }
              />
              <Tooltip
                formatter={(value) => formatINR(Number(value))}
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-popover)",
                }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="var(--color-danger)"
                strokeWidth={2.5}
                fill="url(#analyticsExpenseFill)"
              />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="var(--color-success)"
                strokeWidth={2}
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)]">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">Category comparison</h2>
          <p className="text-sm text-muted-foreground">
            Current period versus the previous matching period.
          </p>
        </div>
        <div className="mt-5 divide-y divide-border/60">
          {comparison.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">No expense data for this period.</p>
          ) : (
            comparison.map((item) => (
              <div key={item.name} className="flex flex-wrap items-center gap-3 py-3">
                <span className="min-w-28 flex-1 text-sm font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground">{formatINR(item.current)}</span>
                <span className="text-sm text-muted-foreground">
                  previous {formatINR(item.previous)}
                </span>
                <span
                  className={
                    item.change !== null && item.change > 0
                      ? "flex items-center gap-1 text-sm text-danger"
                      : "flex items-center gap-1 text-sm text-success"
                  }
                >
                  {item.change === null ? (
                    "New"
                  ) : item.change > 0 ? (
                    <>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      {item.change}%
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-3.5 w-3.5" />
                      {Math.abs(item.change)}%
                    </>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </PageShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <Card className="rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="font-display mt-4 truncate text-2xl font-semibold">{value}</p>
      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
    </Card>
  );
}
