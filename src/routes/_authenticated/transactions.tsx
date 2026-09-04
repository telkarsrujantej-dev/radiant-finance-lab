import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Banknote,
  Bus,
  Clapperboard,
  Download,
  GraduationCap,
  HeartPulse,
  Pencil,
  ReceiptText,
  Search,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { PeriodFilter } from "@/components/finance/PeriodFilter";
import { AddTransactionButton, TransactionDialog } from "@/components/finance/TransactionDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useFinance } from "@/lib/finance-store";
import { byPeriod } from "@/lib/finance-selectors";
import {
  ALL_CATEGORIES,
  PAYMENT_METHODS,
  formatDate,
  formatINR,
  periodFromPreset,
  type Period,
  type Transaction,
} from "@/lib/finance-data";

const title = "Transactions — Finance Tracker";
const description =
  "Search, filter, edit and export every income and expense recorded in your Finance Tracker.";

export const Route = createFileRoute("/_authenticated/transactions")({
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
  component: TransactionsPage,
});

export const CATEGORY_ICONS: Record<string, typeof Wallet> = {
  Food: UtensilsCrossed,
  Travel: Bus,
  Shopping: ShoppingBag,
  Entertainment: Clapperboard,
  Bills: ReceiptText,
  Education: GraduationCap,
  Health: HeartPulse,
  Salary: Banknote,
  Freelance: Banknote,
  Investments: Banknote,
};

function toCSV(rows: Transaction[]) {
  const head = ["Date", "Name", "Category", "Type", "Method", "Amount", "Notes"];
  const body = rows.map((t) =>
    [t.date, t.name, t.category, t.kind, t.method, t.amount, t.notes ?? ""]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [head.join(","), ...body].join("\n");
}

function TransactionsPage() {
  const { state, deleteTransaction } = useFinance();
  const [period, setPeriod] = useState<Period>(() => periodFromPreset("this-year"));
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | "income" | "expense">("all");
  const [category, setCategory] = useState("all");
  const [method, setMethod] = useState("all");
  const [visible, setVisible] = useState(12);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return byPeriod(state.transactions, period).filter((t) => {
      if (kind !== "all" && t.kind !== kind) return false;
      if (category !== "all" && t.category !== category) return false;
      if (method !== "all" && t.method !== method) return false;
      if (q && !`${t.name} ${t.category} ${t.method}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [state.transactions, period, kind, category, method, query]);

  const shown = filtered.slice(0, visible);

  const exportCSV = () => {
    const blob = new Blob([toCSV(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported", { description: `${filtered.length} transactions` });
  };

  return (
    <PageShell
      subtitle="All activity"
      title="Transactions"
      actions={
        <>
          <PeriodFilter period={period} onChange={setPeriod} />
          <Button variant="outline" className="rounded-xl border-border/70" onClick={exportCSV}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <AddTransactionButton />
        </>
      }
    >
      <Card className="animate-fade-in rounded-2xl border-border/60 p-4 shadow-[var(--shadow-soft)]">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions"
              className="rounded-xl pl-9"
            />
          </div>
          <Select value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {ALL_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="animate-fade-in rounded-2xl border-border/60 p-2 shadow-[var(--shadow-soft)] sm:p-4">
        {shown.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No transactions match these filters.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {shown.map((t) => {
              const Icon = CATEGORY_ICONS[t.category] ?? Wallet;
              const income = t.kind === "income";
              return (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center gap-3 px-2 py-3 transition-colors hover:bg-accent/50 sm:px-3"
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      income ? "bg-success/12 text-success" : "bg-accent text-foreground",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.category} · {formatDate(t.date)} · {t.method}
                    </p>
                  </div>
                  <p
                    className={cn(
                      "font-display text-sm font-semibold tabular-nums",
                      income ? "text-success" : "text-foreground",
                    )}
                  >
                    {income ? "+" : "−"}
                    {formatINR(t.amount)}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit transaction"
                      onClick={() => {
                        setEditing(t);
                        setEditOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete transaction"
                      onClick={() => setPendingDelete(t)}
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {visible < filtered.length && (
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full rounded-xl"
              onClick={() => setVisible((v) => v + 12)}
            >
              Load more ({filtered.length - visible} remaining)
            </Button>
          </div>
        )}
      </Card>

      <TransactionDialog open={editOpen} onOpenChange={setEditOpen} initial={editing} />

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Are you sure you want to delete this transaction?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.name} · {pendingDelete && formatINR(pendingDelete.amount)}. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-danger text-white hover:bg-danger/90"
              onClick={() => {
                if (pendingDelete) deleteTransaction(pendingDelete.id);
                setPendingDelete(null);
                toast.success("Transaction deleted");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
