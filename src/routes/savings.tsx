import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Wallet } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
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
import { useFinance } from "@/lib/finance-store";
import { formatDate, formatINR, type Goal } from "@/lib/finance-data";

const title = "Savings Goals — Finance Tracker";
const description = "Create savings goals, add money and track progress toward each target date.";

export const Route = createFileRoute("/savings")({
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
  component: SavingsPage,
});

function SavingsPage() {
  const { state, upsertGoal, addToGoal, deleteGoal } = useFinance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const [moneyFor, setMoneyFor] = useState<Goal | null>(null);
  const [moneyAmount, setMoneyAmount] = useState("");

  const openNew = () => {
    setEditing(null);
    setName("");
    setTarget("");
    setSaved("");
    setTargetDate("");
    setOpen(true);
  };

  const openEdit = (g: Goal) => {
    setEditing(g);
    setName(g.name);
    setTarget(String(g.target));
    setSaved(String(g.saved));
    setTargetDate(g.targetDate);
    setOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name the goal");
      return;
    }
    const t = Number(target);
    if (!t || t <= 0) {
      toast.error("Enter a valid target");
      return;
    }
    upsertGoal({
      id: editing?.id ?? "",
      name: name.trim(),
      target: t,
      saved: Number(saved) || 0,
      targetDate: targetDate || new Date().toISOString().slice(0, 10),
    });
    toast.success(editing ? "Goal updated" : "Goal created");
    setOpen(false);
  };

  return (
    <PageShell
      subtitle="Plan ahead"
      title="Savings Goals"
      actions={
        <Button className="rounded-xl" onClick={openNew}>
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {state.goals.map((g, i) => {
          const pct = g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
          return (
            <Card
              key={g.id}
              style={{ animationDelay: `${i * 60}ms` }}
              className="animate-fade-in rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                    <Wallet className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <p className="font-display text-base font-semibold tracking-tight">{g.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatINR(g.saved)} / {formatINR(g.target)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit goal"
                    onClick={() => openEdit(g)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete goal"
                    onClick={() => {
                      deleteGoal(g.id);
                      toast.success("Goal removed");
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-medium">{pct}%</span>
                <span className="text-muted-foreground">Target: {formatDate(g.targetDate)}</span>
              </div>

              <Button
                variant="outline"
                className="mt-4 w-full rounded-xl"
                onClick={() => {
                  setMoneyFor(g);
                  setMoneyAmount("");
                }}
              >
                Add Money
              </Button>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Edit Goal" : "New Goal"}</DialogTitle>
            <DialogDescription>Track progress toward a savings target.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal-name">Goal name</Label>
              <Input id="goal-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="goal-target">Target (₹)</Label>
                <Input
                  id="goal-target"
                  type="number"
                  min="1"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-saved">Saved (₹)</Label>
                <Input
                  id="goal-saved"
                  type="number"
                  min="0"
                  value={saved}
                  onChange={(e) => setSaved(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-date">Target date</Label>
              <Input
                id="goal-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full rounded-xl">
                Save Goal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!moneyFor} onOpenChange={(o) => !o && setMoneyFor(null)}>
        <DialogContent className="rounded-2xl sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="font-display">Add money</DialogTitle>
            <DialogDescription>{moneyFor?.name}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const value = Number(moneyAmount);
              if (!value || value <= 0) {
                toast.error("Enter a valid amount");
                return;
              }
              if (moneyFor) addToGoal(moneyFor.id, value);
              toast.success(`${formatINR(value)} added to ${moneyFor?.name}`);
              setMoneyFor(null);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="money">Amount (₹)</Label>
              <Input
                id="money"
                type="number"
                min="1"
                value={moneyAmount}
                onChange={(e) => setMoneyAmount(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full rounded-xl">
                Add
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
