import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BarChart3, Lightbulb, LockKeyhole, Sparkles } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/lib/finance-store";
import { categoryTotals, computeTotals } from "@/lib/finance-selectors";
import { formatMoney, periodFromPreset } from "@/lib/finance-data";

const title = "AI Insights — Finance Tracker";
const description = "A reserved space for future personalized finance insights in Finance Tracker.";

export const Route = createFileRoute("/_authenticated/ai-insights")({
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
  component: AiInsightsPage,
});

function AiInsightsPage() {
  const { state } = useFinance();
  const period = periodFromPreset("this-year");
  const totals = computeTotals(state, period);
  const categories = categoryTotals(state.transactions, period);
  const topCategory = categories[0];
  const money = (value: number) => formatMoney(value, state.settings.currency);
  const insights = [
    totals.income > 0
      ? `You are saving ${Math.round((totals.savings / totals.income) * 100)}% of recorded income this year.`
      : "Add an income transaction to unlock savings-rate guidance.",
    topCategory
      ? `${topCategory.name} is your largest expense category at ${money(topCategory.value)}.`
      : "Add expenses to see where your money is going.",
    totals.budget > 0
      ? `Your recorded spending is ${Math.round((totals.expenses / totals.budget) * 100)}% of your monthly budget.`
      : "Set a monthly budget to track spending headroom.",
  ];
  return (
    <PageShell subtitle="Personalized guidance" title="AI Insights">
      <Card className="relative overflow-hidden rounded-2xl border-border/60 p-6 shadow-[var(--shadow-soft)] sm:p-10">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-accent/60 blur-3xl" />
        <div className="relative mx-auto max-w-2xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="h-6 w-6" />
          </span>
          <p className="mt-6 text-sm font-medium text-primary">Workspace-aware guidance</p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            A clearer view of your money
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            These summaries are generated from your saved transactions, budgets, and goals. For deeper questions, use Finance Assistant.
          </p>
          <div className="mt-8 grid gap-3 text-left">
            {insights.map((insight) => (
              <div key={insight} className="flex gap-3 rounded-xl border border-border/60 bg-muted/40 p-4">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
          <Button asChild variant="outline" className="mt-8 rounded-xl">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}

