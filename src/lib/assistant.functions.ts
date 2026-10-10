import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";

type StoredAssistantMessage = {
  id: string;
  role: "user" | "assistant";
  parts: Json[];
};

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  parts: z.array(z.unknown()).transform((parts) => parts as Json[]),
}) as z.ZodType<StoredAssistantMessage>;

const messagesSchema = z.array(messageSchema);

export const loadAssistantMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("finance_workspaces")
      .select("assistant_messages")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (error) throw new Error("Unable to load your assistant history.");
    return messagesSchema.safeParse(data?.assistant_messages ?? []).data ?? [];
  });

export const saveAssistantMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const parsed = z.object({ messages: messagesSchema }).safeParse(input);
    if (!parsed.success) throw new Error("Invalid assistant history.");
    return parsed.data;
  })
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("finance_workspaces")
      .update({ assistant_messages: data.messages as Json })
      .eq("user_id", context.userId);

    if (error) throw new Error("Unable to save your assistant history.");
    return { ok: true };
  });