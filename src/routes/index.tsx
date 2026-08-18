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
import { FinanceProvider, useFinance } from "@/lib/finance-store";
import {
  categoryTotals,
  computeTotals,
  monthlySeries,
  yearlySeries,
} from "@/lib/finance-selectors";
import { monthPeriod, SEED_YEAR, type Transaction } from "@/lib/finance-data";

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
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <FinanceProvider>
      <Dashboard />
    </FinanceProvider>
  );
}

function Dashboard() {
  const { state, addTransaction } = useFinance();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(id);
  }, []);

  // Latest month present in the data set.
  const period = useMemo(() => {
    const latest = state.transactions.reduce((acc, t) => (t.date > acc ? t.date : acc), "");
    const d = latest ? new Date(`${latest}T00:00:00`) : new Date(SEED_YEAR, 7, 1);
    return monthPeriod(d.getFullYear(), d.getMonth());
  }, [state.transactions]);

  const totals = useMemo(() => computeTotals(state, period), [state, period]);

  const categoryData = useMemo(
    () => categoryTotals(state.transactions, period),
    [state.transactions, period],
  );

  const monthly = useMemo(
    () => monthlySeries(state.transactions, Number(period.from.slice(0, 4))),
    [state.transactions, period],
  );

  const yearly = useMemo(
    () => yearlySeries(state.transactions).map((r) => ({ ...r })),
    [state.transactions],
  );

  const handleAdd = (t: Transaction) => {
    const { id: _id, ...rest } = t;
    addTransaction(rest);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Good evening,</p>
              <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {state.settings.userName}
              </h1>
            </div>
            <AddTransactionDialog onAdd={handleAdd} />
          </header>

          <SummaryCards totals={totals} loading={loading} />

          <ExpensesChart loading={loading} monthly={monthly} yearly={yearly} />

          <div className="grid gap-6 xl:grid-cols-2">
            <IncomeExpensesChart loading={loading} data={monthly} />
            <CategoryDonut data={categoryData} loading={loading} />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <RecentTransactions transactions={state.transactions} loading={loading} />
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
