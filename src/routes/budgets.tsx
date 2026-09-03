import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { PeriodFilter } from "@/components/finance/PeriodFilter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFinance } from "@/lib/finance-store";
import { budgetUsage } from "@/lib/finance-selectors";
import {
  EXPENSE_CATEGORIES,
  formatINR,
  periodFromPreset,
  type Budget,
  type Period,
} from "@/lib/finance-data";

const title = "Budgets — Finance Tracker";
const description = "Set category budgets and watch usage update automatically from your spending.";

export const Route = createFileRoute("/budgets")({
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
  component: BudgetsPage,
});

function BudgetsPage() {
  const { state, upsertBudget, deleteBudget } = useFinance();
  const [period, setPeriod] = useState<Period>(() => periodFromPreset("this-month"));
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");

  const usage = useMemo(
    () => budgetUsage(state.budgets, state.transactions, period),
    [state.budgets, state.transactions, period],
  );

  const openNew = () => {
    setEditing(null);
    setCategory("");
    setLimit("");
    setOpen(true);
  };

  const openEdit = (b: Budget) => {
    setEditing(b);
    setCategory(b.category);
    setLimit(String(b.limit));
    setOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(limit);
    if (!category) {
      toast.error("Pick a category");
      return;
    }
    if (!value || value <= 0) {
      toast.error("Enter a valid limit");
      return;
    }
    upsertBudget({ id: editing?.id ?? "", category, limit: value });
    toast.success(editing ? "Budget updated" : "Budget created");
    setOpen(false);
  };

  return (
    <PageShell
      subtitle="Spending limits"
      title="Budgets"
      actions={
        <>
          <PeriodFilter period={period} onChange={setPeriod} />
          <Button className="rounded-xl" onClick={openNew}>
            <Plus className="h-4 w-4" />
            New Budget
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {usage.map((b, i) => (
          <Card
            key={b.id}
            style={{ animationDelay: `${i * 60}ms` }}
            className="animate-fade-in rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-base font-semibold tracking-tight">{b.category}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatINR(b.spent)} / {formatINR(b.limit)}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit budget"
                  onClick={() => openEdit(b)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete budget"
                  onClick={() => {
                    deleteBudget(b.id);
                    toast.success("Budget removed");
                  }}
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            </div>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-700",
                  b.status === "exceeded"
                    ? "bg-danger"
                    : b.status === "warning"
                      ? "bg-[#f59e0b]"
                      : "bg-primary",
                )}
                style={{ width: `${Math.min(100, b.pct)}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{b.pct}% used</span>
              <span className="font-medium">{formatINR(b.remaining)} left</span>
            </div>

            {b.status !== "ok" && (
              <p
                className={cn(
                  "mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs",
                  b.status === "exceeded"
                    ? "bg-danger/12 text-danger"
                    : "bg-[#f59e0b]/12 text-[#b45309]",
                )}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {b.status === "exceeded"
                  ? "Budget exceeded for this period"
                  : "You are close to this budget limit"}
              </p>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit Budget" : "New Budget"}
            </DialogTitle>
            <DialogDescription>Usage is calculated from your transactions.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit">Monthly limit (₹)</Label>
              <Input
                id="limit"
                type="number"
                min="1"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full rounded-xl">
                Save Budget
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
