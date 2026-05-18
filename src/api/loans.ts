import { http } from "./http";

export interface LoanResponse {
  id: number;
  userId: number;
  userEmail: string;
  bookId: number;
  bookTitle: string;
  bookIsbn: string;
  loanDate: string;
  returnedAt: string | null;
  status: string;
  createdAt: string;
}

export const loansApi = {
  listMine(): Promise<LoanResponse[]> {
    return http<LoanResponse[]>("/loans/my-loans");
  },

  listAll(): Promise<LoanResponse[]> {
    return http<LoanResponse[]>("/loans");
  },

  create(bookId: string | number): Promise<LoanResponse> {
    return http<LoanResponse>("/loans", {
      method: "POST",
      body: { bookId: Number(bookId) },
    });
  },

  returnLoan(id: string | number): Promise<LoanResponse> {
    return http<LoanResponse>(`/loans/${id}/return`, { method: "PUT" });
  },
};
