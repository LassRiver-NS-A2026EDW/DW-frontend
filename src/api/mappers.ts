import type { LoginResponse } from "./auth";
import type { BookResponse, BookUpsertRequest } from "./books";
import type { LoanResponse } from "./loans";
import type { ReservationResponse } from "./reservations";
import type { ReviewResponse } from "./reviews";
import type { UserProfileResponse } from "./users";
import type { Book, Loan, Reservation, Review, User } from "../mocks/mockData";

export function mapBackendRole(role: string): User["role"] {
  if (role === "ADMIN") return "admin";
  if (role === "LIBRARIAN") return "librarian";
  return "user";
}

export function userFromBackend(user: UserProfileResponse | LoginResponse, email?: string): User {
  return {
    id: String(user.id),
    name: user.name,
    email: "email" in user ? user.email : email ?? "",
    role: mapBackendRole(user.role),
  };
}

export function bookFromBackend(b: BookResponse): Book {
  const active = (b.status ?? "ACTIVE").toUpperCase() === "ACTIVE";
  const book: Book = {
    id: String(b.id),
    title: b.title,
    author: b.author,
    isbn: b.isbn,
    category: b.category ?? "General",
    language: b.language ?? "Espanol",
    publisher: b.publisher ?? "Sin editorial",
    publishDate: b.publishDate ?? b.createdAt?.slice(0, 10) ?? "",
    pages: b.pages ?? 0,
    description: b.description ?? "Sin descripcion disponible.",
    coverUrl:
      b.coverUrl ||
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    rating: b.rating ?? 0,
    available: active,
    active,
    reviewCount: b.reviewCount ?? 0,
    hasPdf: Boolean(b.hasPdf),
    pdfUrl: b.pdfUrl,
    isReservedByMe: Boolean(b.reservedByMe),
    loanCooldownUntil: b.loanCooldownUntil,
    totalCopies: b.totalCopies ?? 0,
    availableCopies: b.availableCopies ?? (active ? 1 : 0),
    waitingReservations: b.waitingReservations ?? 0,
  };
  book.available = active && (book.availableCopies ?? 0) > 0;
  return book;
}

export function bookToUpsert(book: Omit<Book, "id"> | Book): BookUpsertRequest {
  return {
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    category: book.category,
    language: book.language,
    coverUrl: book.coverUrl,
    publisher: book.publisher,
    publishDate: book.publishDate || null,
    pages: book.pages || null,
    description: book.description,
  };
}

export function reviewFromBackend(r: ReviewResponse): Review {
  return {
    id: String(r.id),
    bookId: String(r.bookId),
    userId: String(r.userId),
    userName: r.userName || r.userEmail,
    rating: r.rating,
    comment: r.comment,
    date: r.createdAt?.slice(0, 10) ?? "",
    flagged: r.status?.toUpperCase() === "HIDDEN",
    flagReason: r.status,
  };
}

export function loanFromBackend(l: LoanResponse): Loan {
  return {
    id: String(l.id),
    bookId: String(l.bookId),
    bookTitle: l.bookTitle,
    userId: String(l.userId),
    userName: l.userEmail,
    loanDate: l.loanDate?.slice(0, 10) ?? "",
    dueDate: l.dueDate?.replace("T", " ").slice(0, 16) ?? "",
    returnDate: l.returnedAt?.slice(0, 10),
    status:
      l.status?.toUpperCase() === "RETURNED"
        ? "returned"
        : l.status?.toUpperCase() === "OVERDUE"
          ? "overdue"
          : "active",
    copyId: l.copyId == null ? null : String(l.copyId),
    copyCode: l.copyCode,
    renewalCount: l.renewalCount ?? 0,
    canRenew: Boolean(l.canRenew),
    blockedReason: l.blockedReason,
  };
}

export function reservationFromBackend(r: ReservationResponse): Reservation {
  return {
    id: String(r.id),
    bookId: String(r.bookId),
    bookTitle: r.bookTitle,
    userId: String(r.userId),
    userEmail: r.userEmail,
    status:
      r.status?.toUpperCase() === "FULFILLED"
        ? "fulfilled"
        : r.status?.toUpperCase() === "CANCELLED"
          ? "cancelled"
          : "waiting",
    requestedLoanDurationMinutes: r.requestedLoanDurationMinutes,
    queuePosition: r.queuePosition,
    fulfilledLoanId: r.fulfilledLoanId == null ? null : String(r.fulfilledLoanId),
    createdAt: r.createdAt?.replace("T", " ").slice(0, 16) ?? "",
    fulfilledAt: r.fulfilledAt?.replace("T", " ").slice(0, 16) ?? null,
    cancelledAt: r.cancelledAt?.replace("T", " ").slice(0, 16) ?? null,
  };
}
