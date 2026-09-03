export type TxKind = "income" | "expense";

export type Transaction = {
  id: string;
  name: string;
  category: string;
  date: string; // ISO yyyy-mm-dd
  amount: number;
  kind: TxKind;
  method: string;
  notes?: string | undefined;
};

export type Budget = {
  id: string;
  category: string;
  limit: number;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  targetDate: string; // ISO yyyy-mm-dd
};

export type Frequency = "Daily" | "Weekly" | "Monthly" | "Yearly";

export type Recurring = {
  id: string;
  name: string;
  amount: number;
  kind: TxKind;
  category: string;
  method: string;
  frequency: Frequency;
  nextDate: string;
  active: boolean;
};

export type Settings = {
  userName: string;
  monthlyBudget: number;
  openingBalance: number;
};

export const EXPENSE_CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Entertainment",
  "Bills",
  "Education",
  "Health",
  "Other",
] as const;

export const INCOME_CATEGORIES = ["Salary", "Freelance", "Investments", "Other"] as const;

export const ALL_CATEGORIES = [
  ...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]),
] as string[];

export const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Debit Card",
  "Credit Card",
  "Bank Transfer",
  "Other",
] as const;

export const FREQUENCIES: Frequency[] = ["Daily", "Weekly", "Monthly", "Yearly"];

/* ------------------------------------------------------------------ */
/* Seed data                                                           */
/* ------------------------------------------------------------------ */

type MonthPlan = {
  month: number; // 1-12
  income: number;
  expenses: [string, number][];
};

const MONTH_PLANS: MonthPlan[] = [
  {
    month: 1,
    income: 40000,
    expenses: [
      ["Food", 2600],
      ["Travel", 1400],
      ["Shopping", 1800],
      ["Bills", 1300],
      ["Entertainment", 600],
      ["Other", 300],
    ],
  },
  {
    month: 2,
    income: 41000,
    expenses: [
      ["Food", 3200],
      ["Travel", 1500],
      ["Shopping", 2400],
      ["Bills", 1400],
      ["Entertainment", 1200],
      ["Health", 800],
    ],
  },
  {
    month: 3,
    income: 40500,
    expenses: [
      ["Food", 2400],
      ["Travel", 1100],
      ["Shopping", 1500],
      ["Bills", 1300],
      ["Entertainment", 700],
      ["Education", 500],
    ],
  },
  {
    month: 4,
    income: 42000,
    expenses: [
      ["Food", 3400],
      ["Travel", 2200],
      ["Shopping", 3000],
      ["Bills", 1500],
      ["Entertainment", 1100],
      ["Health", 800],
    ],
  },
  {
    month: 5,
    income: 43000,
    expenses: [
      ["Food", 2900],
      ["Travel", 1600],
      ["Shopping", 2100],
      ["Bills", 1400],
      ["Entertainment", 900],
      ["Other", 600],
    ],
  },
  {
    month: 6,
    income: 43500,
    expenses: [
      ["Food", 3600],
      ["Travel", 3000],
      ["Shopping", 3200],
      ["Bills", 1600],
      ["Entertainment", 1400],
      ["Education", 1200],
    ],
  },
  {
    month: 7,
    income: 44000,
    expenses: [
      ["Food", 3100],
      ["Travel", 1800],
      ["Shopping", 2600],
      ["Bills", 1500],
      ["Entertainment", 1000],
      ["Health", 1500],
    ],
  },
  {
    month: 8,
    income: 45000,
    expenses: [
      ["Food", 5000],
      ["Travel", 3500],
      ["Shopping", 4000],
      ["Bills", 2500],
      ["Entertainment", 2000],
      ["Other", 1250],
    ],
  },
];

const EXPENSE_NAMES: Record<string, string[]> = {
  Food: ["Groceries", "Dinner out", "Coffee & snacks"],
  Travel: ["Cab rides", "Fuel", "Metro pass"],
  Shopping: ["Clothing", "Home essentials", "Online order"],
  Entertainment: ["Movie night", "Streaming plans", "Concert tickets"],
  Bills: ["Electricity bill", "Internet bill", "Mobile recharge"],
  Education: ["Online course", "Books"],
  Health: ["Pharmacy", "Doctor visit", "Gym membership"],
  Other: ["Misc spends", "Gifts"],
};

const METHOD_CYCLE = ["UPI", "Credit Card", "Debit Card", "Bank Transfer", "Cash"];
const DAY_CYCLE = [4, 8, 11, 15, 19, 23, 26];

const pad = (n: number) => String(n).padStart(2, "0");

export const SEED_YEAR = 2026;

function buildSeedTransactions(): Transaction[] {
  const out: Transaction[] = [];
  let n = 0;

  for (const plan of MONTH_PLANS) {
    out.push({
      id: `seed-inc-${plan.month}`,
      name: "Monthly salary",
      category: "Salary",
      date: `${SEED_YEAR}-${pad(plan.month)}-01`,
      amount: plan.income,
      kind: "income",
      method: "Bank Transfer",
      notes: "Credited by employer",
    });

    plan.expenses.forEach(([category, amount], i) => {
      const names = EXPENSE_NAMES[category] ?? ["Expense"];
      // Split larger amounts into two entries for a realistic list.
      const parts =
        amount >= 3000 ? [Math.round(amount * 0.6), amount - Math.round(amount * 0.6)] : [amount];
      parts.forEach((part, j) => {
        out.push({
          id: `seed-exp-${plan.month}-${i}-${j}`,
          name: names[(i + j) % names.length] ?? "Expense",
          category,
          date: `${SEED_YEAR}-${pad(plan.month)}-${pad(DAY_CYCLE[(i + j) % DAY_CYCLE.length] ?? 5)}`,
          amount: part,
          kind: "expense",
          method: METHOD_CYCLE[n++ % METHOD_CYCLE.length] ?? "UPI",
        });
      });
    });
  }

  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const seedTransactions = buildSeedTransactions();

export const seedBudgets: Budget[] = [
  { id: "b-food", category: "Food", limit: 6000 },
  { id: "b-shopping", category: "Shopping", limit: 5000 },
  { id: "b-travel", category: "Travel", limit: 4000 },
  { id: "b-bills", category: "Bills", limit: 3000 },
  { id: "b-entertainment", category: "Entertainment", limit: 2500 },
];

export const seedGoals: Goal[] = [
  { id: "g-laptop", name: "New Laptop", target: 60000, saved: 35000, targetDate: "2026-12-15" },
  { id: "g-emergency", name: "Emergency Fund", target: 150000, saved: 92000, targetDate: "2027-06-30" },
  { id: "g-vacation", name: "Vacation", target: 80000, saved: 24000, targetDate: "2027-03-01" },
  { id: "g-education", name: "Education", target: 120000, saved: 40000, targetDate: "2027-08-31" },
];

export const seedRecurring: Recurring[] = [
  {
    id: "r-salary",
    name: "Salary",
    amount: 45000,
    kind: "income",
    category: "Salary",
    method: "Bank Transfer",
    frequency: "Monthly",
    nextDate: "2026-09-01",
    active: true,
  },
  {
    id: "r-internet",
    name: "Internet",
    amount: 999,
    kind: "expense",
    category: "Bills",
    method: "UPI",
    frequency: "Monthly",
    nextDate: "2026-09-05",
    active: true,
  },
  {
    id: "r-electricity",
    name: "Electricity",
    amount: 1500,
    kind: "expense",
    category: "Bills",
    method: "UPI",
    frequency: "Monthly",
    nextDate: "2026-09-08",
    active: true,
  },
  {
    id: "r-subscription",
    name: "Subscription",
    amount: 649,
    kind: "expense",
    category: "Entertainment",
    method: "Credit Card",
    frequency: "Monthly",
    nextDate: "2026-09-12",
    active: false,
  },
];

export const seedSettings: Settings = {
  userName: "Srujan",
  monthlyBudget: 30000,
  openingBalance: 25000,
};

/** Archive figures for years before the tracked seed year (read-only history). */
export const historicalYears: { year: number; income: number; expenses: number }[] = [
  { year: 2022, income: 310000, expenses: 92000 },
  { year: 2023, income: 386000, expenses: 108500 },
  { year: 2024, income: 442000, expenses: 121400 },
  { year: 2025, income: 486000, expenses: 134800 },
];

/* ------------------------------------------------------------------ */
/* Formatting + date helpers                                           */
/* ------------------------------------------------------------------ */

export const formatINR = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;

export const formatCompactINR = (value: number) =>
  value >= 1000 ? `₹${Math.round(value / 1000)}k` : `₹${Math.round(value)}`;

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export type PeriodPreset =
  | "this-month"
  | "last-month"
  | "this-year"
  | "last-year"
  | "custom";

export type Period = {
  preset: PeriodPreset;
  from: string;
  to: string;
};

export function periodFromPreset(preset: Exclude<PeriodPreset, "custom">, ref = new Date()): Period {
  const y = ref.getFullYear();
  const m = ref.getMonth();
  switch (preset) {
    case "this-month":
      return { preset, from: toISO(new Date(y, m, 1)), to: toISO(new Date(y, m + 1, 0)) };
    case "last-month":
      return { preset, from: toISO(new Date(y, m - 1, 1)), to: toISO(new Date(y, m, 0)) };
    case "this-year":
      return { preset, from: `${y}-01-01`, to: `${y}-12-31` };
    case "last-year":
      return { preset, from: `${y - 1}-01-01`, to: `${y - 1}-12-31` };
  }
}

export function monthPeriod(year: number, month0: number): Period {
  return {
    preset: "custom",
    from: toISO(new Date(year, month0, 1)),
    to: toISO(new Date(year, month0 + 1, 0)),
  };
}

export function periodLabel(period: Period): string {
  switch (period.preset) {
    case "this-month":
      return "This Month";
    case "last-month":
      return "Last Month";
    case "this-year":
      return "This Year";
    case "last-year":
      return "Last Year";
    default: {
      const from = new Date(`${period.from}T00:00:00`);
      const to = new Date(`${period.to}T00:00:00`);
      const sameMonth =
        from.getFullYear() === to.getFullYear() &&
        from.getMonth() === to.getMonth() &&
        from.getDate() === 1 &&
        to.getDate() === new Date(to.getFullYear(), to.getMonth() + 1, 0).getDate();
      if (sameMonth) return `${MONTH_NAMES[from.getMonth()]} ${from.getFullYear()}`;
      const sameYear =
        from.getFullYear() === to.getFullYear() &&
        from.getMonth() === 0 &&
        from.getDate() === 1 &&
        to.getMonth() === 11;
      if (sameYear) return `${from.getFullYear()}`;
      return `${formatDate(period.from)} – ${formatDate(period.to)}`;
    }
  }
}

export const inPeriod = (iso: string, period: Period) => iso >= period.from && iso <= period.to;

export function previousPeriod(period: Period): Period {
  const from = new Date(`${period.from}T00:00:00`);
  const to = new Date(`${period.to}T00:00:00`);
  const days = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
  const prevTo = new Date(from.getTime() - 86400000);
  const prevFrom = new Date(prevTo.getTime() - (days - 1) * 86400000);
  return { preset: "custom", from: toISO(prevFrom), to: toISO(prevTo) };
}
