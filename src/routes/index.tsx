import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import { PeriodFilter } from "@/components/finance/PeriodFilter";
import { AddTransactionButton } from "@/components/finance/TransactionDialog";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ExpensesChart } from "@/components/dashboard/ExpensesChart";
import { IncomeExpensesChart } from "@/components/dashboard/IncomeExpensesChart";
import { CategoryDonut } from "@/components/dashboard/CategoryDonut";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { AiInsightsCard } from "@/components/dashboard/AiInsightsCard";
import { FinancialHealthCard } from "@/components/dashboard/FinancialHealthCard";
import { useFinance } from "@/lib/finance-store";
import {
  categoryTotals,
  computeTotals,
  financialHealth,
  monthlySeries,
  yearlySeries,
} from "@/lib/finance-selectors";
import { periodFromPreset, type Period } from "@/lib/finance-data";

const title = "Finance Tracker — Personal Finance Dashboard";
const description =
  "Track balance, income, expenses, budgets and spending categories in one clean, modern finance dashboard.";

export const Route = createFileRoute("/")({
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
  component: Dashboard,
});

function Dashboard() {
  const { state } = useFinance();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>(() => periodFromPreset("this-month"));

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(id);
  }, []);

  const totals = useMemo(() => computeTotals(state, period), [state, period]);
  const health = useMemo(() => financialHealth(state, period), [state, period]);
  const categoryData = useMemo(
    () => categoryTotals(state.transactions, period),
    [state.transactions, period],
  );
  const monthly = useMemo(
    () => monthlySeries(state.transactions, Number(period.from.slice(0, 4))),
    [state.transactions, period],
  );
  const yearly = useMemo(() => yearlySeries(state.transactions), [state.transactions]);

  return (
    <PageShell
      subtitle="Welcome back,"
      title={state.settings.userName}
      actions={
        <>
          <PeriodFilter period={period} onChange={setPeriod} />
          <AddTransactionButton />
        </>
      }
    >
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
          <FinancialHealthCard health={health} loading={loading} />
          <BudgetProgress spent={totals.expenses} budget={totals.budget} loading={loading} />
          <AiInsightsCard loading={loading} />
        </div>
      </div>
    </PageShell>
  );
}
