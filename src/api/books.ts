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
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ListBooksParams {
  title?: string;
  category?: string;
  page?: number;
  size?: number;
}

export const booksApi = {
  list(params: ListBooksParams = {}): Promise<Page<BookResponse>> {
    return http<Page<BookResponse>>("/books", { method: "GET", query: params });
  },
};
