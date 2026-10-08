const LOVABLE_AIG_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

export function createLovableAiGatewayRunIdFetch(initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;
  return {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(LOVABLE_AIG_RUN_ID_HEADER)) headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);
      const response = await fetch(input, { ...init, headers });
      runId ??= response.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim() || undefined;
      return response;
    },
    getRunId: () => runId,
    waitForRunId: () => Promise.resolve(runId),
  };
}

export function getLovableAiGatewayRunId(request: Request) {
  return request.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim() || undefined;
}

export function withLovableAiGatewayRunIdHeader(response: Response, gateway: { getRunId: () => string | undefined }) {
  const headers = new Headers(response.headers);
  const runId = gateway.getRunId();
  if (runId) headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}