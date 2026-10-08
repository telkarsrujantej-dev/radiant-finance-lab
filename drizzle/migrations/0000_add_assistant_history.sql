ALTER TABLE public.finance_workspaces
  ADD COLUMN assistant_messages jsonb NOT NULL DEFAULT '[]'::jsonb;