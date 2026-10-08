import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import type { UIMessage } from "ai";

import { createAssistantResponse, getAssistantAuth } from "@/lib/assistant.server";

const requestSchema = z.object({
  messages: z.array(z.unknown()),
});

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = requestSchema.parse(await request.json());
          const { supabase, userId } = await getAssistantAuth(request);
          return await createAssistantResponse(request, supabase, userId, body.messages as UIMessage[]);
        } catch (error) {
          if (error instanceof Response) return error;
          if (error instanceof DOMException && error.name === "AbortError") {
            return new Response("Request stopped", { status: 499 });
          }
          console.error("Assistant request failed", error);
          return new Response("Unable to answer right now. Please try again.", { status: 500 });
        }
      },
    },
  },
});