import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Bot, LockKeyhole, Send, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { loadAssistantMessages, saveAssistantMessages } from "@/lib/assistant.functions";

const title = "Finance Assistant — Finance Tracker";
const description = "Ask practical questions about your spending, budgets, and savings.";

export const Route = createFileRoute("/_authenticated/ai-assistant")({
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
  component: AiAssistantPage,
});

function AiAssistantPage() {
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [historyReady, setHistoryReady] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/api/chat",
        prepareSendMessagesRequest: async ({ messages, headers }) => {
          const { data } = await supabase.auth.getSession();
          return {
            body: { messages },
            headers: {
              ...headers,
              ...(data.session?.access_token
                ? { Authorization: `Bearer ${data.session.access_token}` }
                : {}),
            },
          };
        },
      }),
    [],
  );
  const { messages, sendMessage, status, stop, error, setMessages } = useChat<UIMessage>({
    id: "finance-assistant",
    messages: initialMessages,
    transport,
    onFinish: async ({ messages: completedMessages }) => {
      try {
        await saveAssistantMessages({ data: { messages: completedMessages } });
      } catch (saveError) {
        console.error("Assistant history save failed", saveError);
      }
    },
  });

  useEffect(() => {
    let active = true;
    loadAssistantMessages()
      .then((saved) => {
        if (!active) return;
        setInitialMessages(saved as UIMessage[]);
        setMessages(saved as UIMessage[]);
        setHistoryReady(true);
      })
      .catch((loadError) => {
        console.error("Assistant history load failed", loadError);
        if (active) setHistoryReady(true);
      });
    return () => {
      active = false;
    };
  }, [setMessages]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [historyReady, status]);

  const isBusy = status === "submitted" || status === "streaming";

  return (
    <PageShell subtitle="Private guidance from your actual workspace" title="Finance Assistant">
      <Card className="flex min-h-[min(720px,calc(100vh-210px))] flex-col overflow-hidden rounded-2xl border-border/60 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-display truncate text-sm font-semibold">Finance Assistant</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <LockKeyhole className="h-3 w-3" /> Account-saved conversation
            </p>
          </div>
          <div className="ml-auto hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Workspace-aware
          </div>
        </div>

        <Conversation className="min-h-0 flex-1">
          <ConversationContent className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-8">
            {!historyReady ? (
              <div className="flex items-center gap-3 py-12 text-sm text-muted-foreground">
                <Shimmer>Loading your saved conversation</Shimmer>
              </div>
            ) : messages.length === 0 ? (
              <ConversationEmptyState
                icon={<Bot className="h-8 w-8" />}
                title="What would you like to understand?"
                description="Ask about spending patterns, budgets, savings goals, or upcoming payments."
              />
            ) : (
              messages.map((message) => <AssistantMessage key={message.id} message={message} />)
            )}
            {status === "submitted" && <Shimmer className="text-sm text-muted-foreground">Reviewing your workspace</Shimmer>}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t border-border/60 bg-muted/20 p-4 sm:p-5">
          {error && <p className="mb-2 text-xs text-destructive">{error.message || "The assistant could not respond."}</p>}
          <PromptInput
            className="mx-auto max-w-3xl rounded-xl border-border/70 bg-background"
            onSubmit={async ({ text }) => {
              if (!text.trim() || isBusy) return;
              await sendMessage({ text });
            }}
          >
            <PromptInputTextarea ref={textareaRef} placeholder="Ask about your money..." />
            <PromptInputFooter>
              <span className="px-2 text-[11px] text-muted-foreground">Never share PINs or passwords</span>
              <PromptInputSubmit status={status} onStop={stop} aria-label={isBusy ? "Stop response" : "Send message"}>
                {!isBusy && <Send className="h-4 w-4" />}
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
        </div>
      </Card>
    </PageShell>
  );
}

function AssistantMessage({ message }: { message: UIMessage }) {
  const text = message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("\n");
  return (
    <Message from={message.role}>
      <MessageContent>
        <MessageResponse isAnimating={message.role === "assistant"}>{text}</MessageResponse>
      </MessageContent>
    </Message>
  );
}