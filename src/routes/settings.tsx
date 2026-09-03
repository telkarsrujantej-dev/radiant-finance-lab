import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Settings2 } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFinance } from "@/lib/finance-store";

const title = "Settings — Finance Tracker";
const description = "Adjust your local Finance Tracker preferences and starting figures.";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { state, updateSettings, resetData } = useFinance();
  const [userName, setUserName] = useState(state.settings.userName);
  const [monthlyBudget, setMonthlyBudget] = useState(String(state.settings.monthlyBudget));
  const [openingBalance, setOpeningBalance] = useState(String(state.settings.openingBalance));

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const budget = Number(monthlyBudget);
    const balance = Number(openingBalance);
    if (!userName.trim()) {      toast.error("Enter your name");      return;    }
    if (budget <= 0 || balance < 0) {      toast.error("Check your amounts");      return;    }
    updateSettings({ userName: userName.trim(), monthlyBudget: budget, openingBalance: balance });
    toast.success("Settings saved");
  };

  return <PageShell subtitle="Make it yours" title="Settings"><div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><Card className="rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)] sm:p-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent"><Settings2 className="h-[18px] w-[18px]" /></span><div><h2 className="font-display text-lg font-semibold tracking-tight">Preferences</h2><p className="text-sm text-muted-foreground">These values power your local dashboard.</p></div></div><form onSubmit={save} className="mt-6 space-y-5"><div className="space-y-2"><Label htmlFor="settings-name">Your name</Label><Input id="settings-name" value={userName} onChange={(e) => setUserName(e.target.value)} /></div><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="settings-budget">Monthly budget (₹)</Label><Input id="settings-budget" type="number" min="1" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="settings-balance">Opening balance (₹)</Label><Input id="settings-balance" type="number" min="0" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} /></div></div><Button type="submit" className="rounded-xl">Save Settings</Button></form></Card><Card className="rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)] sm:p-6"><h2 className="font-display text-lg font-semibold tracking-tight">Local data</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Your transactions, budgets, savings goals and recurring items are stored in this browser for this prototype.</p><AlertDialog><AlertDialogTrigger asChild><Button variant="outline" className="mt-6 w-full rounded-xl"><RotateCcw className="h-4 w-4" />Reset demo data</Button></AlertDialogTrigger><AlertDialogContent className="rounded-2xl"><AlertDialogHeader><AlertDialogTitle className="font-display">Reset all demo data?</AlertDialogTitle><AlertDialogDescription>This restores the original Finance Tracker sample data and removes local changes.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction className="rounded-xl" onClick={() => { resetData(); toast.success("Demo data restored"); }}>Reset data</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></Card></div></PageShell>;
}