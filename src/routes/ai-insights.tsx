import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BarChart3, LockKeyhole, Sparkles } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const title = "AI Insights — Finance Tracker";
const description = "A reserved space for future personalized finance insights in Finance Tracker.";

export const Route = createFileRoute("/ai-insights")({
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
  return (
    <PageShell subtitle="Personalized guidance" title="AI Insights">
      <Card className="relative overflow-hidden rounded-2xl border-border/60 p-6 shadow-[var(--shadow-soft)] sm:p-10">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-accent/60 blur-3xl" />
        <div className="relative mx-auto max-w-2xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="h-6 w-6" />
          </span>
          <p className="mt-6 text-sm font-medium text-primary">Coming soon</p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Smarter money decisions are on the way
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            This prototype keeps your finance workspace focused on reliable local tracking.
            Personalized recommendations will be added in a future release.
          </p>
          <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
            <Feature
              icon={BarChart3}
              title="Pattern summaries"
              text="See meaningful changes across your spending history."
            />
            <Feature
              icon={LockKeyhole}
              title="Private by design"
              text="Your current data remains in this browser only."
            />
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

function Feature({
  icon: Icon,
  title: featureTitle,
  text,
}: {
  icon: typeof BarChart3;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-3 text-sm font-medium">{featureTitle}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
