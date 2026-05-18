import { http } from "./http";

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

export interface ListBooksParams {
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
};
