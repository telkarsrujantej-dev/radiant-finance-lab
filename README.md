# Finance Hub

Build a beautiful modern frontend prototype for an AI-powered personal finance web application called Finance Tracker.

For this first prototype, focus ONLY on the frontend dashboard. Do not implement authentication, Supabase, AI, or backend functionality yet. Use realistic dummy financial data.

Design

Create a premium, modern SaaS-style finance dashboard.

The interface should be:

Clean

Professional

Interactive

Minimal but visually attractive

Responsive

Easy to understand

Suitable for desktop and mobile

Use modern typography, rounded cards, subtle shadows, smooth hover effects, and tasteful animations.

Provide light mode and dark mode support.

Sidebar

Create a responsive sidebar with:

Dashboard

Transactions

Income

Expenses

Budgets

Savings

Analytics

AI Insights

AI Assistant

Settings

Highlight Dashboard as the active page.

On mobile, make the sidebar responsive.

Dashboard Header

Show:

Good evening, Srujan 👋

Subtitle:

"Here's your financial overview."

Add:

+ Add Transaction

button on the right.

Summary Cards

Create five attractive cards:

Total Balance

₹72,450

Income

₹45,000

Expenses

₹18,250

Savings

₹26,750

Monthly Budget

₹30,000

Each card should include:

Icon

Main value

Small percentage comparison with previous month

Positive/negative trend indicator

Hover animation

Main Expense Chart

Create a large interactive Monthly Expenses chart.

Use dummy data:

January — ₹8,000
February — ₹10,500
March — ₹7,500
April — ₹12,000
May — ₹9,500
June — ₹14,000
July — ₹11,500
August — ₹18,250

Make the August value visibly higher because the user spent more this month.

Allow the user to switch between:

Monthly

Yearly

Include:

Tooltips

Smooth animations

Clear axis labels

Responsive sizing

Income vs Expenses

Create another interactive chart comparing:

Income

Expenses

for each month.

Use a clean bar or line chart.

Expense Categories

Create a category breakdown using a donut/pie chart.

Example:

Food — ₹5,000
Travel — ₹3,500
Shopping — ₹4,000
Entertainment — ₹2,000
Bills — ₹2,500
Other — ₹1,250

Display the category names and amounts clearly.

Recent Transactions

Create a modern transaction list.

Example transactions:

Salary

₹45,000

Food

₹1,200

Shopping

₹2,500

Travel

₹800

Electricity Bill

₹1,500

Each transaction should show:

Icon

Name

Category

Date

Amount

Clearly distinguish income and expenses.

Add a View All Transactions button.

Budget Progress

Add a small budget section.

Example:

Monthly Budget
₹18,250 / ₹30,000

Show an animated progress bar.

Also show:

₹11,750 remaining

AI Preview

Since AI will be implemented later, create a small placeholder card titled:

AI Financial Insights

Display a visually attractive placeholder such as:

"AI insights will appear here based on your spending patterns."

Add a button:

Explore AI Insights →

Do not implement actual AI functionality yet.

Add Transaction Modal

Make the Add Transaction button functional on the frontend.

When clicked, open a modal containing:

Income / Expense selector

Amount

Description

Category

Date

Payment method

Save Transaction button

For now, store the transaction only in frontend state/local state.

After adding a transaction, update the dashboard values and transaction list dynamically.

Interactions

Add:

Smooth card hover effects

Chart animations

Button hover effects

Modal animations

Toast notification after adding a transaction

Loading skeletons where appropriate

Keep animations subtle and professional.

Important

Do NOT connect Supabase yet.

Do NOT implement AI yet.

Do NOT implement authentication yet.

Use dummy data and frontend state so we can test the UI first.

The goal of this version is to create a beautiful, polished Finance Tracker dashboard prototype that we can later connect to Supabase and AI.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/749073c7-7841-48d4-bbf7-b4402d30401b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
