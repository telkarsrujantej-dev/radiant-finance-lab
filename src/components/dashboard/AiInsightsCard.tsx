import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function AiInsightsCard({ loading }: { loading: boolean }) {
  if (loading) return <Skeleton className="h-[220px] rounded-2xl" />;

  return (
    <Card className="animate-fade-in relative overflow-hidden rounded-2xl border-border/60 p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[image:var(--gradient-primary)] opacity-20 blur-2xl" />
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
          <Sparkles className="h-[18px] w-[18px]" />
        </span>
        <h2 className="font-display text-lg font-semibold tracking-tight">AI Financial Insights</h2>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Personalized insights are coming soon. Your local finance data stays right here until then.
      </p>
      <div className="mt-4 space-y-2">
        {[80, 60, 70].map((w, i) => (
          <div
            key={i}
            className="h-2.5 animate-pulse rounded-full bg-muted"
            style={{ width: `${w}%`, animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
      <Button asChild className="group mt-5 w-full rounded-xl">
        <Link to="/ai-insights">
          Coming Soon
          <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </Button>
    </Card>
  );
}
