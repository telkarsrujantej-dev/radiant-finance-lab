import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatINR, monthlyExpenses, yearlyExpenses } from "@/lib/finance-data";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-popover px-3 py-2 shadow-[var(--shadow-elevated)]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-sm font-semibold">{formatINR(payload[0].value)}</p>
    </div>
  );
}

export function ExpensesChart({
  loading,
  currentMonthExpenses,
}: {
  loading: boolean;
  currentMonthExpenses: number;
}) {
  const [range, setRange] = useState<"monthly" | "yearly">("monthly");

  const data =
    range === "monthly"
      ? monthlyExpenses.map((m, i) =>
          i === monthlyExpenses.length - 1 ? { ...m, expenses: currentMonthExpenses } : m,
        )
      : yearlyExpenses;

  if (loading) return <Skeleton className="h-[380px] rounded-2xl" />;

  return (
    <Card className="animate-fade-in rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-elevated)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">Monthly Expenses</h2>
          <p className="text-sm text-muted-foreground">Spending trend over time</p>
        </div>
        <div className="inline-flex rounded-xl bg-muted p-1">
          {(["monthly", "yearly"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-medium capitalize transition-all duration-200",
                range === r
                  ? "bg-background text-foreground shadow-[var(--shadow-soft)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-[290px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
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
              tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-border)" }} />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              fill="url(#expenseFill)"
              animationDuration={900}
              dot={{ r: 3, fill: "var(--color-primary)", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
