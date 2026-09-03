import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  type Transaction,
  type TxKind,
} from "@/lib/finance-data";
import { useFinance } from "@/lib/finance-store";

const today = () => new Date().toISOString().slice(0, 10);

export function TransactionDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Transaction | null;
}) {
  const { addTransaction, updateTransaction } = useFinance();
  const [kind, setKind] = useState<TxKind>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(today());
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setKind(initial?.kind ?? "expense");
    setAmount(initial ? String(initial.amount) : "");
    setDescription(initial?.name ?? "");
    setCategory(initial?.category ?? "");
    setDate(initial?.date ?? today());
    setMethod(initial?.method ?? "");
    setNotes(initial?.notes ?? "");
  }, [open, initial]);

  const categories = kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {      toast.error("Enter a valid amount");      return;    }
    if (!description.trim()) {      toast.error("Add a short description");      return;    }
    if (!category) {      toast.error("Pick a category");      return;    }

    const payload = {
      name: description.trim(),
      category,
      date,
      amount: value,
      kind,
      method: method || "UPI",
      notes: notes.trim() || undefined,
    };

    if (initial) {
      updateTransaction({ ...payload, id: initial.id });
      toast.success("Transaction updated");
    } else {
      addTransaction(payload);
      toast.success("Transaction added", {
        description: `${kind === "income" ? "Income" : "Expense"} of ₹${value.toLocaleString("en-IN")} saved.`,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-display">
            {initial ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
          <DialogDescription>
            {initial ? "Update the details of this entry." : "Record a new income or expense."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="inline-flex w-full rounded-xl bg-muted p-1">
            {(["expense", "income"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setKind(k);
                  setCategory("");
                }}
                className={cn(
                  "flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition-all duration-200",
                  kind === k
                    ? "bg-background text-foreground shadow-[var(--shadow-soft)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {k}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g. Dinner with friends"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Optional"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full rounded-xl">
              {initial ? "Save Changes" : "Save Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddTransactionButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={cn(
          "rounded-xl shadow-[var(--shadow-soft)] transition-transform duration-200 hover:-translate-y-0.5",
          className,
        )}
      >
        <Plus className="h-4 w-4" />
        Add Transaction
      </Button>
      <TransactionDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
