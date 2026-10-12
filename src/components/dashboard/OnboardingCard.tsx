import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, WalletCards } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function OnboardingCard() {
  return (
    <Card className="animate-fade-in rounded-2xl border-primary/20 bg-primary/[0.04] p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <WalletCards className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display font-semibold">Set up your personal workspace</p>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Add your name, currency, opening balance, and monthly budget to make the dashboard yours.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Private account</span>
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Start from zero</span>
            </div>
          </div>
        </div>
        <Button asChild className="rounded-xl">
          <Link to="/settings">Complete setup <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </Card>
  );
}