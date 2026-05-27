import { http } from "./http";

export interface ReservationResponse {
  id: number;
  userId: number;
  userEmail: string;
  bookId: number;
  bookTitle: string;
  status: string;
  requestedLoanDurationMinutes: number;
  queuePosition: number | null;
  fulfilledLoanId: number | null;
  createdAt: string;
  fulfilledAt: string | null;
  cancelledAt: string | null;
}

export const reservationsApi = {
  listMine(): Promise<ReservationResponse[]> {
    return http<ReservationResponse[]>("/reservations/my");
  },

  create(bookId: string | number, requestedLoanDurationMinutes: number): Promise<ReservationResponse> {
    return http<ReservationResponse>("/reservations", {
      method: "POST",
      body: { bookId: Number(bookId), requestedLoanDurationMinutes },
    });
  },

  cancel(id: string | number): Promise<ReservationResponse> {
    return http<ReservationResponse>(`/reservations/${id}`, { method: "DELETE" });
  },
};
