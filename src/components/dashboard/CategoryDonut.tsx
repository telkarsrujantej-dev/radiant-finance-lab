import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/lib/finance-data";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-muted-foreground)",
];

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-xl border border-border/60 bg-popover px-3 py-2 shadow-[var(--shadow-elevated)]">
      <p className="text-xs text-muted-foreground">{p.name}</p>
      <p className="font-display text-sm font-semibold">{formatINR(p.value)}</p>
    </div>
  );
}

export function CategoryDonut({
  data,
  loading,
}: {
  data: { name: string; value: number }[];
  loading: boolean;
}) {
  if (loading) return <Skeleton className="h-[360px] rounded-2xl" />;

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="animate-fade-in rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-elevated)]">
      <h2 className="font-display text-lg font-semibold tracking-tight">Expense Categories</h2>
      <p className="text-sm text-muted-foreground">Where your money went</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="relative h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={86}
                paddingAngle={3}
                stroke="none"
                animationDuration={900}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="font-display text-lg font-semibold">{formatINR(total)}</span>
          </div>
        </div>

        <ul className="flex flex-col justify-center gap-2.5">
          {data.map((d, i) => (
            <li key={d.name} className="flex items-center gap-2.5 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="flex-1 text-muted-foreground">{d.name}</span>
              <span className="font-medium">{formatINR(d.value)}</span>
              <span className="w-10 text-right text-xs text-muted-foreground">
                {total ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
