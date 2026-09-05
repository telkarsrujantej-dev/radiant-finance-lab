import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { FinanceState } from "./finance-store";

const emptyState: FinanceState = {
  transactions: [],
  budgets: [],
  goals: [],
  recurring: [],
  settings: { userName: "Srujan", monthlyBudget: 30000, openingBalance: 25000 },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asState(value: unknown): FinanceState {
  if (!isRecord(value)) return emptyState;
  const rawSettings = isRecord(value["settings"]) ? value["settings"] : emptyState.settings;
  return {
    transactions: Array.isArray(value["transactions"]) ? value["transactions"] : [],
    budgets: Array.isArray(value["budgets"]) ? value["budgets"] : [],
    goals: Array.isArray(value["goals"]) ? value["goals"] : [],
    recurring: Array.isArray(value["recurring"]) ? value["recurring"] : [],
    settings: {
      userName: typeof rawSettings["userName"] === "string" ? rawSettings["userName"] : "Srujan",
      monthlyBudget:
        typeof rawSettings["monthlyBudget"] === "number" ? rawSettings["monthlyBudget"] : 30000,
      openingBalance:
        typeof rawSettings["openingBalance"] === "number" ? rawSettings["openingBalance"] : 25000,
    },
  };
}

export const loadFinanceWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("finance_workspaces")
      .select("transactions, budgets, goals, recurring, settings")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (error) throw new Error("Unable to load your finance workspace.");
    return data ? asState(data) : null;
  });

export const saveFinanceWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: FinanceState) => input)
  .handler(async ({ context, data }) => {
    const state = asState(data);
    const { error } = await context.supabase.from("finance_workspaces").upsert(
      {
        user_id: context.userId,
        transactions: state.transactions,
        budgets: state.budgets,
        goals: state.goals,
        recurring: state.recurring,
        settings: state.settings,
      },
      { onConflict: "user_id" },
    );

    if (error) throw new Error("Unable to save your finance workspace.");
    return { ok: true };
  });

export const resetFinanceWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("finance_workspaces")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error("Unable to reset your finance workspace.");
    return { ok: true };
  });