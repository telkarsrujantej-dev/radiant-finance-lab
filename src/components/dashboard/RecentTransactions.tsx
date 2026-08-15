import {
  Banknote,
  Bus,
  Clapperboard,
  ReceiptText,
  ShoppingBag,
  UtensilsCrossed,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDate, formatINR, type Transaction } from "@/lib/finance-data";

const ICONS: Record<string, typeof Wallet> = {
  Food: UtensilsCrossed,
  Travel: Bus,
  Shopping: ShoppingBag,
  Entertainment: Clapperboard,
  Bills: ReceiptText,
  Salary: Banknote,
};

export function RecentTransactions({
  transactions,
  loading,
}: {
  transactions: Transaction[];
  loading: boolean;
}) {
  if (loading) return <Skeleton className="h-[420px] rounded-2xl" />;

  return (
    <Card className="animate-fade-in rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">Recent Transactions</h2>
          <p className="text-sm text-muted-foreground">Your latest activity</p>
        </div>
      </div>

      <ul className="mt-4 divide-y divide-border/60">
        {transactions.slice(0, 6).map((t) => {
          const Icon = ICONS[t.category] ?? Wallet;
          const income = t.kind === "income";
          return (
            <li
              key={t.id}
              className="group flex items-center gap-3 rounded-xl px-2 py-3 transition-colors duration-200 hover:bg-accent/60"
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
                  income ? "bg-success/12 text-success" : "bg-danger/12 text-danger",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {t.category} · {formatDate(t.date)}
                </p>
              </div>
              <span
                className={cn(
                  "font-display shrink-0 text-sm font-semibold",
                  income ? "text-success" : "text-danger",
                )}
              >
                {income ? "+" : "−"}
                {formatINR(t.amount)}
              </span>
            </li>
          );
        })}
      </ul>

      <Button variant="outline" className="mt-4 w-full rounded-xl group">
        View All Transactions
        <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </Button>
    </Card>
  );
}
