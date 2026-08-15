export type TxKind = "income" | "expense";

export type Transaction = {
  id: string;
  name: string;
  category: string;
  date: string; // ISO yyyy-mm-dd
  amount: number;
  kind: TxKind;
  method?: string;
};

export const EXPENSE_CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Entertainment",
  "Bills",
  "Other",
] as const;

export const INCOME_CATEGORIES = ["Salary", "Freelance", "Investments", "Other"] as const;

export const PAYMENT_METHODS = ["UPI", "Credit Card", "Debit Card", "Cash", "Net Banking"] as const;

export const monthlyExpenses = [
  { label: "Jan", expenses: 8000, income: 40000 },
  { label: "Feb", expenses: 10500, income: 41000 },
  { label: "Mar", expenses: 7500, income: 40500 },
  { label: "Apr", expenses: 12000, income: 42000 },
  { label: "May", expenses: 9500, income: 43000 },
  { label: "Jun", expenses: 14000, income: 43500 },
  { label: "Jul", expenses: 11500, income: 44000 },
  { label: "Aug", expenses: 18250, income: 45000 },
];

export const yearlyExpenses = [
  { label: "2022", expenses: 92000, income: 310000 },
  { label: "2023", expenses: 108500, income: 386000 },
  { label: "2024", expenses: 121400, income: 442000 },
  { label: "2025", expenses: 134800, income: 486000 },
  { label: "2026", expenses: 91250, income: 339000 },
];

export const initialTransactions: Transaction[] = [
  {
    id: "t1",
    name: "Salary",
    category: "Salary",
    date: "2026-08-01",
    amount: 45000,
    kind: "income",
    method: "Net Banking",
  },
  {
    id: "t2",
    name: "Groceries & dining",
    category: "Food",
    date: "2026-08-04",
    amount: 1200,
    kind: "expense",
    method: "UPI",
  },
  {
    id: "t3",
    name: "Shopping",
    category: "Shopping",
    date: "2026-08-07",
    amount: 2500,
    kind: "expense",
    method: "Credit Card",
  },
  {
    id: "t4",
    name: "Travel",
    category: "Travel",
    date: "2026-08-10",
    amount: 800,
    kind: "expense",
    method: "UPI",
  },
  {
    id: "t5",
    name: "Electricity Bill",
    category: "Bills",
    date: "2026-08-12",
    amount: 1500,
    kind: "expense",
    method: "Net Banking",
  },
];

export const baseCategoryTotals: Record<string, number> = {
  Food: 5000,
  Travel: 3500,
  Shopping: 4000,
  Entertainment: 2000,
  Bills: 2500,
  Other: 1250,
};

export const baseTotals = {
  balance: 72450,
  income: 45000,
  expenses: 18250,
  savings: 26750,
  budget: 30000,
};

export const formatINR = (value: number) =>
  `₹${Math.round(value).toLocaleString("en-IN")}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
