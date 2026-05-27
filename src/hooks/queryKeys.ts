export const queryKeys = {
  books: (params: object) => ["books", params] as const,
  book: (id: string | number) => ["book", String(id)] as const,
  bookFacets: ["book-facets"] as const,
  favorites: ["favorites"] as const,
  loans: (scope: "all" | "mine") => ["loans", scope] as const,
  reservations: ["reservations"] as const,
  notifications: {
    all: ["notifications"] as const,
    list: (status: "all" | "unread", page: number, size: number) =>
      ["notifications", "list", status, page, size] as const,
    unreadCount: ["notifications", "unread-count"] as const,
  },
  reviewsByBook: (bookId: string | number) => ["reviews", "book", String(bookId)] as const,
  adminReviews: ["reviews", "admin"] as const,
};
