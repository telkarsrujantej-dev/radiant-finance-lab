import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bot, LockKeyhole, MessageCircle } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const title = "AI Assistant — Finance Tracker";
const description = "A future conversational workspace for your Finance Tracker data.";

export const Route = createFileRoute("/ai-assistant")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: AiAssistantPage,
});

function AiAssistantPage() {
  return <PageShell subtitle="Your future finance companion" title="AI Assistant"><Card className="rounded-2xl border-border/60 p-6 shadow-[var(--shadow-soft)] sm:p-10"><div className="mx-auto max-w-xl text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent"><Bot className="h-6 w-6" /></span><p className="mt-6 text-sm font-medium text-primary">Coming soon</p><h2 className="font-display mt-2 text-2xl font-semibold tracking-tight">A simpler way to ask about your money</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">The assistant is not enabled in this frontend prototype yet. You can still explore every calculation through the dashboard and analytics views.</p><div className="mt-7 space-y-3 text-left"><div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4"><MessageCircle className="h-5 w-5 shrink-0 text-primary" /><span className="text-sm text-muted-foreground">Ask about trends, budgets and upcoming payments.</span></div><div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4"><LockKeyhole className="h-5 w-5 shrink-0 text-primary" /><span className="text-sm text-muted-foreground">Your current workspace stays local to this browser.</span></div></div><Button asChild variant="outline" className="mt-8 rounded-xl"><Link to="/"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link></Button></div></Card></PageShell>;
}