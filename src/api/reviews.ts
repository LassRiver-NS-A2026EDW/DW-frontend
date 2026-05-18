import { http } from "./http";

export interface ReviewResponse {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  bookId: number;
  bookTitle: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewCreateRequest {
  bookId: number;
  rating: number;
  comment: string;
}

export const reviewsApi = {
  byBook(bookId: string | number): Promise<ReviewResponse[]> {
    return http<ReviewResponse[]>(`/reviews/book/${bookId}`, { auth: false });
  },

  list(status = "VISIBLE"): Promise<ReviewResponse[]> {
    return http<ReviewResponse[]>("/reviews", { query: { status } });
  },

  create(payload: ReviewCreateRequest): Promise<ReviewResponse> {
    return http<ReviewResponse>("/reviews", { method: "POST", body: payload });
  },

  hide(id: string | number): Promise<ReviewResponse> {
    return http<ReviewResponse>(`/reviews/${id}/hide`, { method: "PATCH" });
  },
};
