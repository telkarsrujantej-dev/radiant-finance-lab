import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

const title = "Sign in — Finance Tracker";
const description = "Sign in to securely access your personal Finance Tracker workspace.";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search["next"] === "string" && search["next"].startsWith("/")
      ? search["next"]
      : undefined,
  }),
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
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) void navigate({ to: "/" });
    });
  }, [navigate]);

  const goHome = () => void navigate({ to: "/" });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setLoading(false);
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    if (mode === "signup" && !result.data.session) {
      toast.success("Check your email to confirm your account");
      return;
    }
    goHome();
  };

  const google = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setLoading(false);
      toast.error(result.error.message);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:py-14">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
        <section className="hidden lg:block">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Wallet className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">Finance Tracker</span>
          </div>
          <h1 className="font-display mt-12 max-w-xl text-5xl font-semibold leading-tight tracking-tight">
            Your money, organized around your life.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
            Keep every transaction, budget, goal and recurring payment in one private workspace that follows you across devices.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
            {["Private personal workspace", "Live totals and spending insights", "Secure access from any device"].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/12 text-success"><Check className="h-3.5 w-3.5" /></span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <Card className="rounded-2xl border-border/60 p-6 shadow-[var(--shadow-elevated)] sm:p-8">
          <div className="lg:hidden">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Wallet className="h-5 w-5" /></span>
              <span className="font-display text-lg font-semibold">Finance Tracker</span>
            </div>
          </div>
          <div className="mt-7 lg:mt-0">
            <p className="text-sm font-medium text-primary">Welcome back</p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight">
              {mode === "signin" ? "Sign in to your workspace" : "Create your workspace"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">Your finance data stays private to your account.</p>
          </div>
          <Button type="button" variant="outline" className="mt-7 w-full rounded-xl" onClick={google} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="font-semibold">G</span>}
            Continue with Google
          </Button>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="auth-email">Email</Label><Input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="auth-password">Password</Label><Input id="auth-password" type="password" minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button type="submit" className="w-full rounded-xl" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{mode === "signin" ? "Sign in" : "Create account"}<ArrowRight className="h-4 w-4" /></>}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">{mode === "signin" ? "New to Finance Tracker?" : "Already have an account?"}{" "}<button type="button" className="font-medium text-primary hover:underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>{mode === "signin" ? "Create an account" : "Sign in"}</button></p>
        </Card>
      </div>
    </main>
  );
}