import { http } from "./http";

export interface FavoriteResponse {
  id: number;
  bookId: number;
  title: string;
  author: string;
  isbn: string;
  status: string;
  favoritedAt: string;
}

export interface FavoriteToggleResponse {
  bookId: number;
  favorite: boolean;
}

export const favoritesApi = {
  list(): Promise<FavoriteResponse[]> {
    return http<FavoriteResponse[]>("/favorites");
  },

  toggle(bookId: string | number): Promise<FavoriteToggleResponse> {
    return http<FavoriteToggleResponse>(`/favorites/${bookId}`, { method: "POST" });
  },
};
