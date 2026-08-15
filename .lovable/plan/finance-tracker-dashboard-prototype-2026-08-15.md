# Finance Tracker — Dashboard Prototype

A polished, frontend-only finance dashboard with dummy data. No backend, no auth, no AI logic.

## Design direction

Premium SaaS finance look: deep ink/emerald accent palette, generous whitespace, rounded (xl/2xl) cards, soft layered shadows, crisp modern sans typography (display font for numbers, neutral sans for body). Light and dark mode with a toggle in the sidebar footer. Subtle motion only: card lift on hover, chart draw-in, modal fade+scale, animated progress bar.

## Layout

```text
+----------+---------------------------------------------+
| Sidebar  | Header: Good evening, Srujan + Add Txn      |
|          | 5 summary cards (Balance/Income/Expenses/   |
| nav      |          Savings/Monthly Budget)            |
| items    | Monthly Expenses chart (Monthly | Yearly)   |
|          | Income vs Expenses | Expense Categories     |
|          | Recent Transactions | Budget + AI Insights  |
+----------+---------------------------------------------+
```

- Sidebar: Dashboard (active), Transactions, Income, Expenses, Budgets, Savings, Analytics, AI Insights, AI Assistant, Settings. Collapsible on desktop, slide-over drawer with hamburger on mobile. Only Dashboard has content; other items are visible nav entries.
- Fully responsive: cards stack to 2-up then 1-up, charts resize, transaction rows condense on mobile.

## Content

- Summary cards: values as specified, each with an icon, main value, % change vs last month, colored up/down trend chip, hover lift.
- Monthly Expenses: area/line chart Jan–Aug with the given values (August ₹18,250 as the visible spike), Monthly/Yearly toggle, tooltips, animated draw, labeled axes.
- Income vs Expenses: grouped bar chart per month with legend and tooltips.
- Expense Categories: donut chart (Food 5,000 / Travel 3,500 / Shopping 4,000 / Entertainment 2,000 / Bills 2,500 / Other 1,250) with a legend listing name + amount + share.
- Recent Transactions: the five listed entries with category icon, name, category, date, amount; income in green with +, expenses in red with −; "View All Transactions" button.
- Budget Progress: ₹18,250 / ₹30,000 animated bar, ₹11,750 remaining.
- AI Insights: gradient placeholder card with the placeholder copy and an "Explore AI Insights →" button (non-functional).

## Add Transaction modal

Dialog with Income/Expense toggle, amount, description, category select, date picker, payment method select, and Save Transaction. On save: validate required fields, prepend to the transaction list, recompute balance/income/expenses/savings/budget progress and the category donut in local state, close modal, show a success toast.

## Interactions

Skeleton placeholders on first mount (short simulated load) for cards, charts and the transaction list; hover effects on cards, rows and buttons; subtle modal and toast animations.

## Technical notes

- All work in `src/routes/index.tsx` plus new components under `src/components/dashboard/`; dummy data and types in `src/lib/finance-data.ts`.
- Charts with Recharts (already available via shadcn chart primitives); dialog, select, progress, toast (sonner) from shadcn UI, with `<Toaster />` mounted in `__root.tsx`.
- Dashboard state held in a single React state object in the page component — no persistence.
- Colors, gradients and shadows added as semantic tokens in `src/styles.css` for both themes; no hardcoded color utilities.
- Route head metadata set for the dashboard page.
