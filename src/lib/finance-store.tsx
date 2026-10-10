import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  seedBudgets,
  seedGoals,
  seedRecurring,
  seedSettings,
  seedTransactions,
  type Budget,
  type Goal,
  type Recurring,
  type Settings,
  type Transaction,
} from "./finance-data";
import { loadFinanceWorkspace, saveFinanceWorkspace } from "./finance-cloud.functions";
import { supabase } from "@/integrations/supabase/client";

export type FinanceState = {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  recurring: Recurring[];
  settings: Settings;
};

const initialState: FinanceState = {
  transactions: seedTransactions,
  budgets: seedBudgets,
  goals: seedGoals,
  recurring: seedRecurring,
  settings: seedSettings,
};

type FinanceContextValue = {
  state: FinanceState;
  hydrated: boolean;
  synced: boolean;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  upsertBudget: (b: Budget) => void;
  deleteBudget: (id: string) => void;
  upsertGoal: (g: Goal) => void;
  addToGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
  upsertRecurring: (r: Recurring) => void;
  toggleRecurring: (id: string) => void;
  deleteRecurring: (id: string) => void;
  updateSettings: (s: Partial<Settings>) => void;
  resetData: () => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.round(Math.random() * 1e6)}`;

const sortTx = (list: Transaction[]) =>
  [...list].sort((a, b) => (a.date === b.date ? (a.id < b.id ? 1 : -1) : a.date < b.date ? 1 : -1));

function readLegacyState(): FinanceState | null {
  try {
    const raw = localStorage.getItem("finance-tracker-state-v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FinanceState>;
    return {
      transactions: parsed.transactions ?? initialState.transactions,
      budgets: parsed.budgets ?? initialState.budgets,
      goals: parsed.goals ?? initialState.goals,
      recurring: parsed.recurring ?? initialState.recurring,
      settings: { ...initialState.settings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return null;
  }
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [synced, setSynced] = useState(false);
  const loadWorkspace = useServerFn(loadFinanceWorkspace);
  const saveWorkspace = useServerFn(saveFinanceWorkspace);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data.user || cancelled) {
          if (!cancelled) setHydrated(true);
          return;
        }

        const remote = await loadWorkspace();
        if (cancelled) return;

        if (remote) {
          setState(remote);
        } else {
          const legacy = readLegacyState() ?? initialState;
          setState(legacy);
          await saveWorkspace({ data: legacy });
        }

        localStorage.removeItem("finance-tracker-state-v1");
        setSynced(true);
      } catch (error) {
        console.error("Finance workspace sync failed", error);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [loadWorkspace, saveWorkspace]);

  useEffect(() => {
    if (!hydrated || !synced) return;
    const timeout = window.setTimeout(() => {
      void saveWorkspace({ data: state }).catch((error: unknown) => {
        console.error("Finance workspace save failed", error);
        setSynced(false);
      });
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [state, hydrated, synced, saveWorkspace]);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    setState((s) => ({ ...s, transactions: sortTx([{ ...t, id: newId() }, ...s.transactions]) }));
    setSynced(true);
  }, []);

  const updateTransaction = useCallback((t: Transaction) => {
    setState((s) => ({
      ...s,
      transactions: sortTx(s.transactions.map((x) => (x.id === t.id ? t : x))),
    }));
    setSynced(true);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState((s) => ({ ...s, transactions: s.transactions.filter((x) => x.id !== id) }));
    setSynced(true);
  }, []);

  const upsertBudget = useCallback((b: Budget) => {
    setState((s) => ({
      ...s,
      budgets: s.budgets.some((x) => x.id === b.id)
        ? s.budgets.map((x) => (x.id === b.id ? b : x))
        : [...s.budgets, { ...b, id: b.id || newId() }],
    }));
    setSynced(true);
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setState((s) => ({ ...s, budgets: s.budgets.filter((x) => x.id !== id) }));
    setSynced(true);
  }, []);

  const upsertGoal = useCallback((g: Goal) => {
    setState((s) => ({
      ...s,
      goals: s.goals.some((x) => x.id === g.id)
        ? s.goals.map((x) => (x.id === g.id ? g : x))
        : [...s.goals, { ...g, id: g.id || newId() }],
    }));
    setSynced(true);
  }, []);

  const addToGoal = useCallback((id: string, amount: number) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) =>
        g.id === id ? { ...g, saved: Math.max(0, g.saved + amount) } : g,
      ),
    }));
    setSynced(true);
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setState((s) => ({ ...s, goals: s.goals.filter((x) => x.id !== id) }));
    setSynced(true);
  }, []);

  const upsertRecurring = useCallback((r: Recurring) => {
    setState((s) => ({
      ...s,
      recurring: s.recurring.some((x) => x.id === r.id)
        ? s.recurring.map((x) => (x.id === r.id ? r : x))
        : [...s.recurring, { ...r, id: r.id || newId() }],
    }));
    setSynced(true);
  }, []);

  const toggleRecurring = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      recurring: s.recurring.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    }));
    setSynced(true);
  }, []);

  const deleteRecurring = useCallback((id: string) => {
    setState((s) => ({ ...s, recurring: s.recurring.filter((x) => x.id !== id) }));
    setSynced(true);
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
    setSynced(true);
  }, []);

  const resetData = useCallback(() => {
    setState(initialState);
    setSynced(true);
  }, []);

  const value = useMemo<FinanceContextValue>(
    () => ({
      state,
      hydrated,
      synced,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      upsertBudget,
      deleteBudget,
      upsertGoal,
      addToGoal,
      deleteGoal,
      upsertRecurring,
      toggleRecurring,
      deleteRecurring,
      updateSettings,
      resetData,
    }),
    [
      state,
      hydrated,
      synced,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      upsertBudget,
      deleteBudget,
      upsertGoal,
      addToGoal,
      deleteGoal,
      upsertRecurring,
      toggleRecurring,
      deleteRecurring,
      updateSettings,
      resetData,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}