import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR, monthlyExpenses } from "@/lib/finance-data";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-popover px-3 py-2 shadow-[var(--shadow-elevated)]">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="capitalize text-muted-foreground">{p.dataKey}</span>
          <span className="font-display font-semibold">{formatINR(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function IncomeExpensesChart({
  loading,
  currentIncome,
  currentExpenses,
}: {
  loading: boolean;
  currentIncome: number;
  currentExpenses: number;
}) {
  if (loading) return <Skeleton className="h-[360px] rounded-2xl" />;

  const data = monthlyExpenses.map((m, i) =>
    i === monthlyExpenses.length - 1
      ? { ...m, income: currentIncome, expenses: currentExpenses }
      : m,
  );

  return (
    <Card className="animate-fade-in rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-elevated)]">
      <h2 className="font-display text-lg font-semibold tracking-tight">Income vs Expenses</h2>
      <p className="text-sm text-muted-foreground">Month by month comparison</p>
      <div className="mt-6 h-[270px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
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
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-muted)", opacity: 0.5 }} />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: "var(--color-muted-foreground)" }}
            />
            <Bar dataKey="income" fill="var(--color-success)" radius={[6, 6, 0, 0]} animationDuration={900} />
            <Bar dataKey="expenses" fill="var(--color-danger)" radius={[6, 6, 0, 0]} animationDuration={900} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
