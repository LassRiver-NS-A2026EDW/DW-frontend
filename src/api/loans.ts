import { http } from "./http";

export interface LoanResponse {
  id: number;
  userId: number;
  userEmail: string;
  bookId: number;
  bookTitle: string;
  bookIsbn: string;
  copyId: number | null;
  copyCode: string | null;
  loanDate: string;
  dueDate: string;
  returnedAt: string | null;
  status: string;
  renewalCount: number;
  canRenew: boolean;
  blockedReason: string | null;
  createdAt: string;
}

export interface LoanRenewalResponse {
  id: number;
  loanId: number;
  previousDueDate: string;
  newDueDate: string;
  durationMinutes: number;
  createdAt: string;
}

export const loansApi = {
  listMine(): Promise<LoanResponse[]> {
    return http<LoanResponse[]>("/loans/my-loans");
  },

  listAll(): Promise<LoanResponse[]> {
    return http<LoanResponse[]>("/loans");
  },

  create(bookId: string | number, durationMinutes: number): Promise<LoanResponse> {
    return http<LoanResponse>("/loans", {
      method: "POST",
      body: { bookId: Number(bookId), durationMinutes },
    });
  },

  returnLoan(id: string | number): Promise<LoanResponse> {
    return http<LoanResponse>(`/loans/${id}/return`, { method: "PUT" });
  },

  renew(id: string | number, durationMinutes: number): Promise<LoanResponse> {
    return http<LoanResponse>(`/loans/${id}/renew`, {
      method: "POST",
      body: { durationMinutes },
    });
  },

  history(id: string | number): Promise<LoanRenewalResponse[]> {
    return http<LoanRenewalResponse[]>(`/loans/${id}/history`);
  },
};
