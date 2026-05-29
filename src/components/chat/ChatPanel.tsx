import { FormEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, KeyRound, Send, Settings, Trash2, X, User } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { chatStream, ChatMessage } from "../../api/chat";

const DEEPSEEK_KEY_STORAGE = "bookworm.ai.deepseekKey";

interface ChatPanelProps {
  bookId: string;
  bookDescription: string;
  selectedText: string;
  onClearSelectedText: () => void;
  onClose?: () => void;
}

export function ChatPanel({ bookId, bookDescription, selectedText, onClearSelectedText, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Array<ChatMessage & { isStreaming?: boolean }>>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [personalApiKey, setPersonalApiKey] = useState(() => localStorage.getItem(DEEPSEEK_KEY_STORAGE) ?? "");
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem(DEEPSEEK_KEY_STORAGE) ?? "");
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    const container = messagesRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setQuestion("");
    setIsLoading(false);
    setError(null);
  };

  const savePersonalApiKey = () => {
    const cleanKey = apiKeyInput.trim();
    setPersonalApiKey(cleanKey);
    if (cleanKey) {
      localStorage.setItem(DEEPSEEK_KEY_STORAGE, cleanKey);
    } else {
      localStorage.removeItem(DEEPSEEK_KEY_STORAGE);
    }
  };

  const clearPersonalApiKey = () => {
    setPersonalApiKey("");
    setApiKeyInput("");
    localStorage.removeItem(DEEPSEEK_KEY_STORAGE);
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion || isLoading) return;

    const history = messages
      .filter((message) => !message.isStreaming)
      .map(({ role, content }) => ({ role, content }));

    setMessages((current) => [
      ...current,
      { role: "user", content: cleanQuestion },
      { role: "assistant", content: "", isStreaming: true },
    ]);
    setQuestion("");
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    await chatStream(
      {
        bookId,
        selectedText,
        context: bookDescription,
        question: cleanQuestion,
        providerApiKey: personalApiKey || undefined,
        history,
      },
      {
        signal: controller.signal,
        onChunk: (chunk) => {
          setMessages((current) => {
            const next = [...current];
            const last = next[next.length - 1];
            if (last?.role === "assistant") {
              next[next.length - 1] = { ...last, content: last.content + chunk };
            }
            return next;
          });
        },
        onDone: () => {
          setMessages((current) => markLastAssistantDone(current));
          setIsLoading(false);
          onClearSelectedText();
        },
        onError: (message) => {
          setMessages((current) => markLastAssistantDone(current, message));
          setError(message);
          setIsLoading(false);
        },
      }
    );
  };

  return (
    <aside className="h-full min-h-0 min-w-0 flex flex-col border-l border-border bg-card">
      <div className="h-14 shrink-0 px-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Bot className="h-4 w-4 text-primary" />
          Asistente IA
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen((current) => !current)}
            aria-label="Configurar clave de IA"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose ?? clearChat} aria-label="Cerrar chat">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {settingsOpen && (
        <div className="shrink-0 border-b border-border bg-background/60 p-4">
          <div className="mb-3 flex items-start gap-2">
            <KeyRound className="mt-0.5 h-4 w-4 text-primary" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Clave personal de DeepSeek</p>
              <p className="text-xs text-muted-foreground">
                Se guarda solo en este navegador y se usa como respaldo si la clave del sistema falla.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="password"
              value={apiKeyInput}
              onChange={(event) => setApiKeyInput(event.target.value.slice(0, 300))}
              placeholder="sk-..."
              autoComplete="off"
            />
            <Button type="button" onClick={savePersonalApiKey} disabled={apiKeyInput.trim() === personalApiKey}>
              Guardar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearPersonalApiKey}
              disabled={!personalApiKey && !apiKeyInput}
              aria-label="Eliminar clave personal"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {personalApiKey && (
            <p className="mt-2 text-xs text-muted-foreground">Clave activa: {maskApiKey(personalApiKey)}</p>
          )}
        </div>
      )}

      <div ref={messagesRef} className="flex-1 min-h-0 overflow-auto custom-scroll p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground px-4">
            <Bot className="h-10 w-10 mb-3 text-primary" />
            <p className="font-medium text-foreground">Chat con el libro</p>
            <p className="text-sm mt-1">Selecciona un fragmento o escribe una pregunta directa.</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`flex min-w-0 gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "assistant" && <MessageAvatar icon="bot" />}
            <div
              className={`min-w-0 max-w-[86%] overflow-hidden rounded-2xl px-3 py-2 text-sm leading-relaxed break-words [overflow-wrap:anywhere] ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}
            >
              <MarkdownMessage content={message.content || (message.isStreaming ? "Pensando..." : "")} />
              {message.isStreaming && message.content && <span className="ml-1 animate-pulse">|</span>}
            </div>
            {message.role === "user" && <MessageAvatar icon="user" />}
          </div>
        ))}
      </div>

      {selectedText && (
        <div className="mx-4 mb-3 rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs">
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 line-clamp-3 break-words text-muted-foreground [overflow-wrap:anywhere]">{selectedText}</p>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClearSelectedText}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <p>{error}</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 h-7 px-2 text-xs"
            onClick={() => setSettingsOpen(true)}
          >
            Configurar clave personal
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="shrink-0 p-3 border-t border-border flex gap-2">
        <Textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value.slice(0, 2000))}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Escribe tu pregunta sobre el libro..."
          rows={2}
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={!question.trim() || isLoading} aria-label="Enviar">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </aside>
  );
}

function maskApiKey(apiKey: string) {
  if (apiKey.length <= 8) return "••••";
  return `${apiKey.slice(0, 3)}...${apiKey.slice(-4)}`;
}

function MessageAvatar({ icon }: { icon: "bot" | "user" }) {
  return (
    <div className="h-7 w-7 shrink-0 rounded-full bg-muted flex items-center justify-center">
      {icon === "bot" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
    </div>
  );
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{children}</p>,
        h1: ({ children }) => <h1 className="mb-2 text-base font-bold leading-snug">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-2 text-sm font-bold leading-snug">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-2 text-sm font-semibold leading-snug">{children}</h3>,
        ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>,
        li: ({ children }) => <li className="break-words [overflow-wrap:anywhere]">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="mb-2 border-l-2 border-primary/50 pl-3 text-muted-foreground last:mb-0">
            {children}
          </blockquote>
        ),
        a: ({ children, href }) => (
          <a href={href} target="_blank" rel="noreferrer" className="break-all underline underline-offset-2">
            {children}
          </a>
        ),
        pre: ({ children }) => (
          <pre className="mb-2 max-w-full overflow-x-auto custom-scroll whitespace-pre-wrap break-words rounded-md bg-background/70 p-2 text-xs leading-relaxed last:mb-0 [overflow-wrap:anywhere]">
            {children}
          </pre>
        ),
        code: ({ children, className }) => {
          const isBlock = Boolean(className);
          return (
            <code
              className={
                isBlock
                  ? `${className ?? ""} whitespace-pre-wrap break-words [overflow-wrap:anywhere]`
                  : "rounded bg-background/70 px-1 py-0.5 text-[0.85em] break-all"
              }
            >
              {children}
            </code>
          );
        },
        table: ({ children }) => (
          <div className="mb-2 max-w-full overflow-x-auto custom-scroll last:mb-0">
            <table className="w-full border-collapse text-xs">{children}</table>
          </div>
        ),
        th: ({ children }) => <th className="border border-border px-2 py-1 text-left font-semibold">{children}</th>,
        td: ({ children }) => <td className="border border-border px-2 py-1 align-top">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function markLastAssistantDone(
  messages: Array<ChatMessage & { isStreaming?: boolean }>,
  errorMessage?: string
) {
  const next = [...messages];
  const last = next[next.length - 1];
  if (last?.role === "assistant") {
    next[next.length - 1] = {
      ...last,
      content: errorMessage ? `Error al contactar la IA: ${errorMessage}` : last.content,
      isStreaming: false,
    };
  }
  return next;
}
