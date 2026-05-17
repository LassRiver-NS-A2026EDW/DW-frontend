const TOKEN_STORAGE_KEY = "lassriver.auth.token";

let inMemoryToken: string | null = null;

export function setAuthToken(token: string | null) {
  inMemoryToken = token;
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function restoreTokenFromStorage(): string | null {
  const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
  inMemoryToken = stored;
  return stored;
}

export function getAuthToken(): string | null {
  return inMemoryToken ?? localStorage.getItem(TOKEN_STORAGE_KEY);
}

export interface ApiError extends Error {
  status: number;
  code?: string;
  fields?: Record<string, string>;
  payload?: unknown;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

interface HttpOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
  query?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(path: string, query?: HttpOptions["query"]): string {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    params.append(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

export async function http<T = unknown>(path: string, options: HttpOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, signal, query } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

  if (!res.ok) {
    const err = new Error(
      (payload && typeof payload === "object" && "message" in payload && (payload as any).message) ||
        res.statusText ||
        "Request failed"
    ) as ApiError;
    err.status = res.status;
    if (payload && typeof payload === "object") {
      err.code = (payload as any).code;
      err.fields = (payload as any).fields;
      err.payload = payload;
    }
    throw err;
  }

  return payload as T;
}
