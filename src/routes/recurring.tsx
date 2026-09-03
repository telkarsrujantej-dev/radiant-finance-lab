import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CalendarClock, Pencil, Plus, Repeat, Trash2, Wallet } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFinance } from "@/lib/finance-store";
import {
  EXPENSE_CATEGORIES,
  FREQUENCIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  formatDate,
  formatINR,
  type Frequency,
  type Recurring,
  type TxKind,
} from "@/lib/finance-data";

const title = "Recurring Payments — Finance Tracker";
const description = "Keep recurring income and payments organized with local reminders and controls.";

export const Route = createFileRoute("/recurring")({
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
  component: RecurringPage,
});

function RecurringPage() {
  const { state, upsertRecurring, toggleRecurring, deleteRecurring } = useFinance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Recurring | null>(null);
  const [kind, setKind] = useState<TxKind>("expense");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [method, setMethod] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [nextDate, setNextDate] = useState("");

  const categories = kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const reset = () => {
    setEditing(null);
    setKind("expense");
    setName("");
    setAmount("");
    setCategory("");
    setMethod("");
    setFrequency("Monthly");
    setNextDate("");
  };

  const openNew = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (item: Recurring) => {
    setEditing(item);
    setKind(item.kind);
    setName(item.name);
    setAmount(String(item.amount));
    setCategory(item.category);
    setMethod(item.method);
    setFrequency(item.frequency);
    setNextDate(item.nextDate);
    setOpen(true);
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(amount);
    if (!name.trim()) toast.error("Name this recurring item"); return;
    if (!value || value <= 0) toast.error("Enter a valid amount"); return;
    if (!category) toast.error("Pick a category"); return;
    if (!nextDate) toast.error("Choose the next date"); return;

    upsertRecurring({
      id: editing?.id ?? "",
      name: name.trim(),
      amount: value,
      kind,
      category,
      method: method || "UPI",
      frequency,
      nextDate,
      active: editing?.active ?? true,
    });
    toast.success(editing ? "Recurring item updated" : "Recurring item added");
    setOpen(false);
    reset();
  };

  return (
    <PageShell
      subtitle="Automate your awareness"
      title="Recurring"
      actions={
        <Button className="rounded-xl" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Add Recurring
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-muted-foreground">Active items</p>
          <p className="font-display mt-2 text-2xl font-semibold">{state.recurring.filter((r) => r.active).length}</p>
        </Card>
        <Card className="rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-muted-foreground">Monthly outflow</p>
          <p className="font-display mt-2 text-2xl font-semibold">
            {formatINR(state.recurring.filter((r) => r.active && r.kind === "expense" && r.frequency === "Monthly").reduce((sum, r) => sum + r.amount, 0))}
          </p>
        </Card>
        <Card className="rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-muted-foreground">Next due</p>
          <p className="font-display mt-2 text-2xl font-semibold">
            {state.recurring.filter((r) => r.active).sort((a, b) => a.nextDate.localeCompare(b.nextDate))[0]?.nextDate
              ? formatDate(state.recurring.filter((r) => r.active).sort((a, b) => a.nextDate.localeCompare(b.nextDate))[0]?.nextDate ?? "")
              : "—"}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {state.recurring.map((item, index) => (
          <Card
            key={item.id}
            style={{ animationDelay: `${index * 60}ms` }}
            className="animate-fade-in rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", item.kind === "income" ? "bg-success/12 text-success" : "bg-accent text-foreground")}>
                  {item.kind === "income" ? <Wallet className="h-[18px] w-[18px]" /> : <Repeat className="h-[18px] w-[18px]" />}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold">{item.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{item.category} · {item.method}</p>
                </div>
              </div>
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", item.active ? "bg-success/12 text-success" : "bg-muted text-muted-foreground")}>
                {item.active ? "Active" : "Paused"}
              </span>
            </div>
            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <p className={cn("font-display text-xl font-semibold", item.kind === "income" && "text-success")}>{item.kind === "income" ? "+" : "−"}{formatINR(item.amount)}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><CalendarClock className="h-3.5 w-3.5" />{item.frequency} · {formatDate(item.nextDate)}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" className="rounded-xl" onClick={() => toggleRecurring(item.id)}>{item.active ? "Pause" : "Resume"}</Button>
                <Button variant="ghost" size="icon" aria-label="Edit recurring item" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" aria-label="Delete recurring item" onClick={() => { deleteRecurring(item.id); toast.success("Recurring item removed"); }}><Trash2 className="h-4 w-4 text-danger" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) reset(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Edit Recurring Item" : "Add Recurring Item"}</DialogTitle>
            <DialogDescription>Keep a local reminder for income or payments that repeat.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="recurring-name">Name</Label><Input id="recurring-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Internet" /></div>
              <div className="space-y-2"><Label htmlFor="recurring-amount">Amount (₹)</Label><Input id="recurring-amount" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Type</Label><Select value={kind} onValueChange={(value) => { setKind(value as TxKind); setCategory(""); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="expense">Expense</SelectItem><SelectItem value="income">Income</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Frequency</Label><Select value={frequency} onValueChange={(value) => setFrequency(value as Frequency)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{FREQUENCIES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{categories.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Payment method</Label><Select value={method} onValueChange={setMethod}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{PAYMENT_METHODS.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label htmlFor="recurring-date">Next date</Label><Input id="recurring-date" type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} /></div>
            <DialogFooter><Button type="submit" className="w-full rounded-xl">Save Recurring Item</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}