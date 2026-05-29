import { buildApiUrl, getAuthToken } from "./http";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  bookId?: string | number;
  selectedText?: string;
  context?: string;
  question: string;
  providerApiKey?: string;
  history?: ChatMessage[];
}

interface ChatStreamHandlers {
  signal?: AbortSignal;
  onChunk: (chunk: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

export async function chatStream(payload: ChatRequest, handlers: ChatStreamHandlers): Promise<void> {
  const token = getAuthToken();
  const response = await fetch(buildApiUrl("/chat"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    signal: handlers.signal,
  });

  if (!response.ok || !response.body) {
    const errorPayload = await response.json().catch(() => null);
    handlers.onError(errorPayload?.message || response.statusText || "No se pudo contactar la IA");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const dataLines = event
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => (line.startsWith("data: ") ? line.slice(6) : line.slice(5)));
        if (dataLines.length === 0) continue;
        const data = dataLines.join("\n");
        if (data === "[DONE]") {
          handlers.onDone();
          return;
        }
        if (data.startsWith("[ERROR]")) {
          handlers.onError(data.slice(7).trim());
          return;
        }
        let chunk = data;
        try {
          const parsed = JSON.parse(data);
          if (typeof parsed === "string") {
            chunk = parsed;
          }
        } catch {
          // Backward compatible with non-JSON SSE chunks.
        }
        handlers.onChunk(chunk);
      }
    }
    handlers.onDone();
  } catch (err: any) {
    if (err?.name !== "AbortError") {
      handlers.onError(err?.message || "Se interrumpio el streaming de IA");
    }
  }
}
