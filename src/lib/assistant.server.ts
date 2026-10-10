import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, validateUIMessages, type UIMessage } from "ai";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./ai-gateway/run-id";

function createSupabaseFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

export async function getAssistantAuth(request: Request) {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";

  if (!url || !key || token.split(".").length !== 3) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient<Database>(url, key, {
    global: {
      fetch: createSupabaseFetch(key),
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  const userId = data.user?.id;
  if (error || !userId) throw new Response("Unauthorized", { status: 401 });

  return { supabase, userId };
}

export async function createAssistantResponse(
  request: Request,
  supabase: SupabaseClient<Database>,
  userId: string,
  messages: UIMessage[],
) {
  const validatedMessages = await validateUIMessages({ messages });
  const { data: workspace } = await supabase
    .from("finance_workspaces")
    .select("transactions, budgets, goals, recurring, settings")
    .eq("user_id", userId)
    .maybeSingle();

  const gatewayKey = process.env["LOVABLE_API_KEY"];
  if (!gatewayKey) throw new Response("AI is not configured yet.", { status: 503 });

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: gatewayKey,
    headers: { "Lovable-API-Key": gatewayKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions: `You are Finance Tracker's practical personal finance assistant. Use only the workspace data below when answering numeric questions. Never claim to have live bank or UPI access. Be concise, clear, and use Indian rupees unless the user asks otherwise. Workspace context: ${JSON.stringify(workspace ?? {})}`,
    messages: await convertToModelMessages(validatedMessages),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  const response = result.toUIMessageStreamResponse({
    originalMessages: validatedMessages,
    sendReasoning: true,
    onFinish: async ({ messages: completedMessages }) => {
      const { error } = await supabase
        .from("finance_workspaces")
        .update({ assistant_messages: completedMessages as unknown as Json })
        .eq("user_id", userId);
      if (error) console.error("Assistant history save failed", error);
    },
  });

  return withLovableAiGatewayRunIdHeader(response, runIdFetch);
}