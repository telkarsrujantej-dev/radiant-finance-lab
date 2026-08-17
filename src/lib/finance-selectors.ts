import {
  historicalYears,
  inPeriod,
  MONTH_NAMES,
  previousPeriod,
  SEED_YEAR,
  type Budget,
  type Period,
  type Transaction,
} from "./finance-data";
import type { FinanceState } from "./finance-store";

export const sum = (list: Transaction[]) => list.reduce((s, t) => s + t.amount, 0);

export const byPeriod = (transactions: Transaction[], period: Period) =>
  transactions.filter((t) => inPeriod(t.date, period));

export type Totals = {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  budget: number;
};

export function computeTotals(state: FinanceState, period: Period): Totals {
  const all = state.transactions;
  const allIncome = sum(all.filter((t) => t.kind === "income"));
  const allExpenses = sum(all.filter((t) => t.kind === "expense"));
  const scoped = byPeriod(all, period);
  const income = sum(scoped.filter((t) => t.kind === "income"));
  const expenses = sum(scoped.filter((t) => t.kind === "expense"));
  return {
    balance: state.settings.openingBalance + allIncome - allExpenses,
    income,
    expenses,
    savings: income - expenses,
    budget: state.settings.monthlyBudget,
  };
}

export function categoryTotals(transactions: Transaction[], period: Period) {
  const map = new Map<string, number>();
  for (const t of byPeriod(transactions, period)) {
    if (t.kind !== "expense") continue;
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/** Month-by-month series for the year covered by the period. */
export function monthlySeries(transactions: Transaction[], year: number) {
  const rows = MONTH_NAMES.slice(0, 12).map((label) => ({ label, expenses: 0, income: 0 }));
  for (const t of transactions) {
    if (Number(t.date.slice(0, 4)) !== year) continue;
    const m = Number(t.date.slice(5, 7)) - 1;
    if (t.kind === "expense") rows[m].expenses += t.amount;
    else rows[m].income += t.amount;
  }
  // Only show months up to the last month with data (keeps Jan–Aug for the seed year).
  const last = rows.reduce((acc, r, i) => (r.expenses || r.income ? i : acc), 0);
  return rows.slice(0, Math.max(last + 1, 1)).map((r) => ({ ...r, label: r.label }));
}

export function yearlySeries(transactions: Transaction[]) {
  const map = new Map<number, { income: number; expenses: number }>();
  for (const h of historicalYears) map.set(h.year, { income: h.income, expenses: h.expenses });
  for (const t of transactions) {
    const y = Number(t.date.slice(0, 4));
    if (y < SEED_YEAR && map.has(y)) continue; // archive years stay fixed
    const row = map.get(y) ?? { income: 0, expenses: 0 };
    if (t.kind === "expense") row.expenses += t.amount;
    else row.income += t.amount;
    map.set(y, row);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, v]) => ({ label: String(year), ...v }));
}

export type BudgetUsage = Budget & {
  spent: number;
  remaining: number;
  pct: number;
  status: "ok" | "warning" | "exceeded";
};

export function budgetUsage(
  budgets: Budget[],
  transactions: Transaction[],
  period: Period,
): BudgetUsage[] {
  const scoped = byPeriod(transactions, period).filter((t) => t.kind === "expense");
  return budgets.map((b) => {
    const spent = sum(scoped.filter((t) => t.category === b.category));
    const pct = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
    return {
      ...b,
      spent,
      remaining: Math.max(0, b.limit - spent),
      pct,
      status: pct >= 100 ? "exceeded" : pct >= 80 ? "warning" : "ok",
    };
  });
}

export type HealthScore = {
  score: number;
  label: string;
  budgetUsage: number;
  savingsRate: number;
  spendingControl: number;
};

export function financialHealth(state: FinanceState, period: Period): HealthScore {
  const totals = computeTotals(state, period);
  const prev = computeTotals(state, previousPeriod(period));

  const usage = totals.budget > 0 ? Math.round((totals.expenses / totals.budget) * 100) : 0;
  const savingsRate =
    totals.income > 0 ? Math.round(((totals.income - totals.expenses) / totals.income) * 100) : 0;

  // Spending control: how this period compares with the previous one.
  let control = 75;
  if (prev.expenses > 0) {
    const change = (totals.expenses - prev.expenses) / prev.expenses;
    control = Math.max(0, Math.min(100, Math.round(100 - change * 100)));
  }

  const budgetScore = Math.max(0, Math.min(100, 100 - Math.max(0, usage - 60)));
  const score = Math.max(
    0,
    Math.min(100, Math.round(budgetScore * 0.35 + Math.max(0, savingsRate) * 0.4 + control * 0.25)),
  );

  const label =
    score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : "Needs attention";

  return {
    score,
    label,
    budgetUsage: Math.min(100, Math.max(0, usage)),
    savingsRate: Math.min(100, Math.max(0, savingsRate)),
    spendingControl: control,
  };
}

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  tone: "warning" | "info" | "success";
};

export function buildNotifications(state: FinanceState, period: Period): AppNotification[] {
  const out: AppNotification[] = [];
  const usage = budgetUsage(state.budgets, state.transactions, period);

  for (const b of usage) {
    if (b.status === "exceeded") {
      out.push({
        id: `budget-${b.id}`,
        title: "Budget exceeded",
        message: `You have used ${b.pct}% of your ${b.category} budget.`,
        tone: "warning",
      });
    } else if (b.status === "warning") {
      out.push({
        id: `budget-${b.id}`,
        title: "Budget warning",
        message: `You have used ${b.pct}% of your ${b.category} budget.`,
        tone: "warning",
      });
    }
  }

  for (const g of state.goals) {
    const pct = g.target > 0 ? Math.round((g.saved / g.target) * 100) : 0;
    if (pct >= 50) {
      out.push({
        id: `goal-${g.id}`,
        title: "Savings goal",
        message: `You reached ${pct}% of your ${g.name} savings goal.`,
        tone: "success",
      });
    }
  }

  const cur = categoryTotals(state.transactions, period);
  const prevList = categoryTotals(state.transactions, previousPeriod(period));
  for (const c of cur) {
    const prev = prevList.find((p) => p.name === c.name)?.value ?? 0;
    if (prev > 0 && c.value > prev * 1.2) {
      out.push({
        id: `spend-${c.name}`,
        title: "Spending alert",
        message: `Your ${c.name} expenses increased this period.`,
        tone: "info",
      });
    }
  }

  out.push({
    id: "monthly-reminder",
    title: "Monthly reminder",
    message: "Review your monthly expenses.",
    tone: "info",
  });

  return out.slice(0, 8);
}

export function comparisonByCategory(transactions: Transaction[], period: Period) {
  const cur = categoryTotals(transactions, period);
  const prev = categoryTotals(transactions, previousPeriod(period));
  return cur.map((c) => {
    const before = prev.find((p) => p.name === c.name)?.value ?? 0;
    const change = before > 0 ? Math.round(((c.value - before) / before) * 100) : null;
    return { name: c.name, current: c.value, previous: before, change };
  });
}

export function statistics(transactions: Transaction[], period: Period) {
  const scoped = byPeriod(transactions, period);
  const expenses = scoped.filter((t) => t.kind === "expense");
  const income = scoped.filter((t) => t.kind === "income");
  const days =
    Math.round(
      (new Date(`${period.to}T00:00:00`).getTime() -
        new Date(`${period.from}T00:00:00`).getTime()) /
        86400000,
    ) + 1;
  const totalExpense = sum(expenses);
  const totalIncome = sum(income);
  const cats = categoryTotals(transactions, period);
  const largest = scoped.reduce<Transaction | null>(
    (acc, t) => (!acc || t.amount > acc.amount ? t : acc),
    null,
  );
  return {
    avgDaily: days > 0 ? totalExpense / days : 0,
    topCategory: cats[0]?.name ?? "—",
    topCategoryValue: cats[0]?.value ?? 0,
    transactionCount: scoped.length,
    savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0,
    largest,
  };
}

/** Daily / weekly spending buckets for the analytics trend chart. */
export function trendSeries(
  transactions: Transaction[],
  period: Period,
  grain: "daily" | "weekly" | "monthly" | "yearly",
) {
  if (grain === "yearly") return yearlySeries(transactions);
  if (grain === "monthly") return monthlySeries(transactions, Number(period.from.slice(0, 4)));

  const scoped = byPeriod(transactions, period);
  const buckets = new Map<string, { expenses: number; income: number }>();
  for (const t of scoped) {
    let key = t.date;
    if (grain === "weekly") {
      const d = new Date(`${t.date}T00:00:00`);
      const week = Math.floor((d.getDate() - 1) / 7) + 1;
      key = `Week ${week}`;
    }
    const row = buckets.get(key) ?? { expenses: 0, income: 0 };
    if (t.kind === "expense") row.expenses += t.amount;
    else row.income += t.amount;
    buckets.set(key, row);
  }
  return [...buckets.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([label, v]) => ({
      label: grain === "daily" ? label.slice(8) : label,
      ...v,
    }));
}
