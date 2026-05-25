import { buildApiUrl, getAuthToken, http } from "./http";

export interface BookResponse {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string | null;
  language: string | null;
  status: string;
  coverUrl: string | null;
  publisher: string | null;
  publishDate: string | null;
  pages: number | null;
  description: string | null;
  rating: number | null;
  reviewCount: number | null;
  hasPdf: boolean | null;
  pdfUrl: string | null;
  reservedByMe: boolean | null;
  createdAt: string;
}

export interface BookUpsertRequest {
  title: string;
  author: string;
  isbn: string;
  category?: string | null;
  language?: string | null;
  coverUrl?: string | null;
  publisher?: string | null;
  publishDate?: string | null;
  pages?: number | null;
  description?: string | null;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface BookPdfResponse {
  bookId: number;
  message: string;
  filename: string;
  pdfUrl: string;
}

export interface ListBooksParams extends Record<string, string | number | boolean | null | undefined> {
  search?: string;
  title?: string;
  category?: string;
  language?: string;
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const booksApi = {
  list(params: ListBooksParams = {}): Promise<Page<BookResponse>> {
    return http<Page<BookResponse>>("/books", { method: "GET", query: params, auth: false });
  },

  get(id: string | number): Promise<BookResponse> {
    return http<BookResponse>(`/books/${id}`, { method: "GET", auth: false });
  },

  create(payload: BookUpsertRequest): Promise<BookResponse> {
    return http<BookResponse>("/books", { method: "POST", body: payload });
  },

  update(id: string | number, payload: BookUpsertRequest): Promise<BookResponse> {
    return http<BookResponse>(`/books/${id}`, { method: "PUT", body: payload });
  },

  updateStatus(id: string | number, status: "ACTIVE" | "INACTIVE"): Promise<BookResponse> {
    return http<BookResponse>(`/books/${id}/status`, { method: "PATCH", query: { status } });
  },

  uploadPdf(id: string | number, file: File): Promise<BookPdfResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return fetchWithAuth<BookPdfResponse>(`/books/${id}/pdf/upload`, {
      method: "POST",
      body: formData,
    });
  },

  downloadPdf(id: string | number, url: string): Promise<BookPdfResponse> {
    return http<BookPdfResponse>(`/books/${id}/pdf/download`, {
      method: "POST",
      body: { url },
    });
  },

  pdfUrl(id: string | number): string {
    return buildApiUrl(`/books/${id}/pdf`);
  },
};

async function fetchWithAuth<T>(path: string, init: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(buildApiUrl(path), { ...init, headers });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || response.statusText || "Request failed");
  }
  return payload as T;
}
