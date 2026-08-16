import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ExpensesChart } from "@/components/dashboard/ExpensesChart";
import { IncomeExpensesChart } from "@/components/dashboard/IncomeExpensesChart";
import { CategoryDonut } from "@/components/dashboard/CategoryDonut";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { AiInsightsCard } from "@/components/dashboard/AiInsightsCard";
import { AddTransactionDialog } from "@/components/dashboard/AddTransactionDialog";
import {
  baseCategoryTotals,
  baseTotals,
  initialTransactions,
  type Transaction,
} from "@/lib/finance-data";

const title = "Finance Tracker — AI-Powered Personal Finance Dashboard";
const description =
  "Track balance, income, expenses, budgets and spending categories in one clean, modern finance dashboard.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(id);
  }, []);

  const added = useMemo(
    () => transactions.filter((t) => !initialTransactions.some((i) => i.id === t.id)),
    [transactions],
  );

  const totals = useMemo(() => {
    const extraIncome = added.filter((t) => t.kind === "income").reduce((s, t) => s + t.amount, 0);
    const extraExpense = added.filter((t) => t.kind === "expense").reduce((s, t) => s + t.amount, 0);
    const income = baseTotals.income + extraIncome;
    const expenses = baseTotals.expenses + extraExpense;
    return {
      balance: baseTotals.balance + extraIncome - extraExpense,
      income,
      expenses,
      savings: income - expenses,
      budget: baseTotals.budget,
    };
  }, [added]);

  const categoryData = useMemo(() => {
    const totalsByCat = { ...baseCategoryTotals };
    for (const t of added) {
      if (t.kind !== "expense") continue;
      totalsByCat[t.category] = (totalsByCat[t.category] ?? 0) + t.amount;
    }
    return Object.entries(totalsByCat).map(([name, value]) => ({ name, value }));
  }, [added]);

  const addTransaction = (t: Transaction) => setTransactions((prev) => [t, ...prev]);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Good evening,</p>
              <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Srujan
              </h1>
            </div>
            <AddTransactionDialog onAdd={addTransaction} />
          </header>

          <SummaryCards totals={totals} loading={loading} />

          <ExpensesChart loading={loading} currentMonthExpenses={totals.expenses} />

          <div className="grid gap-6 xl:grid-cols-2">
            <IncomeExpensesChart
              loading={loading}
              currentIncome={totals.income}
              currentExpenses={totals.expenses}
            />
            <CategoryDonut data={categoryData} loading={loading} />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <RecentTransactions transactions={transactions} loading={loading} />
            </div>
            <div className="space-y-6">
              <BudgetProgress spent={totals.expenses} budget={totals.budget} loading={loading} />
              <AiInsightsCard loading={loading} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
