import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Book, Review, Loan, mockBooks, mockReviews, mockLoans } from "../mocks/mockData";
import { authApi, Gender, LoginResponse } from "../api/auth";
import { booksApi, BookResponse, BookUpsertRequest } from "../api/books";
import { favoritesApi } from "../api/favorites";
import { reviewsApi, ReviewResponse } from "../api/reviews";
import { loansApi, LoanResponse } from "../api/loans";
import { usersApi, UserProfileResponse } from "../api/users";
import { restoreTokenFromStorage, setAuthToken, getAuthToken } from "../api/http";
import {
  firstError,
  validateBook,
  validateLoan,
  validateProfile,
  validateReview,
} from "../utils/validation";

const USER_STORAGE_KEY = "lassriver.auth.user";

function mapBackendRole(role: string): User["role"] {
  return role === "ADMIN" ? "admin" : "user";
}

function userFromBackend(user: UserProfileResponse | LoginResponse, email?: string): User {
  return {
    id: String(user.id),
    name: user.name,
    email: "email" in user ? user.email : email ?? "",
    role: mapBackendRole(user.role),
  };
}

function bookFromBackend(b: BookResponse): Book {
  return {
    id: String(b.id),
    title: b.title,
    author: b.author,
    isbn: b.isbn,
    category: b.category ?? "General",
    language: b.language ?? "Español",
    publisher: b.publisher ?? "Sin editorial",
    publishDate: b.publishDate ?? b.createdAt?.slice(0, 10) ?? "",
    pages: b.pages ?? 0,
    description: b.description ?? "Sin descripción disponible.",
    coverUrl:
      b.coverUrl ||
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    rating: b.rating ?? 0,
    available: (b.status ?? "ACTIVE").toUpperCase() === "ACTIVE",
    reviewCount: b.reviewCount ?? 0,
  };
}

function bookToUpsert(book: Omit<Book, "id"> | Book): BookUpsertRequest {
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

function reviewFromBackend(r: ReviewResponse): Review {
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

function loanFromBackend(l: LoanResponse): Loan {
  const loanDate = l.loanDate?.slice(0, 10) ?? "";
  const dueDate = loanDate
    ? new Date(new Date(loanDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    : "";

  return {
    id: String(l.id),
    bookId: String(l.bookId),
    bookTitle: l.bookTitle,
    userId: String(l.userId),
    userName: l.userEmail,
    loanDate,
    dueDate,
    returnDate: l.returnedAt?.slice(0, 10),
    status: l.status?.toUpperCase() === "RETURNED" ? "returned" : "active",
  };
}

interface AppContextType {
  currentUser: User | null;
  books: Book[];
  reviews: Review[];
  loans: Loan[];
  favorites: string[];
  booksLoading: boolean;
  bookPage: number;
  bookPageSize: number;
  bookTotalElements: number;
  bookTotalPages: number;
  searchQuery: string;
  categoryFilter: string;
  languageFilter: string;
  ratingFilter: string;
  availabilityFilter: string;
  currentView: string;
  selectedBook: Book | null;
  sidebarCollapsed: boolean;
  theme: "light" | "dark";
  authLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    gender: Gender;
    birthDate: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshBooks: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
  refreshReviewsForBook: (bookId: string) => Promise<void>;
  refreshAdminReviews: () => Promise<void>;
  refreshLoans: () => Promise<void>;
  updateProfile: (user: Partial<User>) => Promise<void>;
  changePassword: (input: { currentPassword: string; newPassword: string }) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setLanguageFilter: (language: string) => void;
  setRatingFilter: (rating: string) => void;
  setAvailabilityFilter: (availability: string) => void;
  setBookPage: (page: number) => void;
  toggleFavorite: (bookId: string) => Promise<void>;
  addReview: (review: Omit<Review, "id" | "date">) => Promise<void>;
  deleteReview: (reviewId: string) => void;
  addBook: (book: Omit<Book, "id">) => Promise<void>;
  updateBook: (bookId: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (bookId: string) => void;
  addLoan: (loan: Omit<Loan, "id">) => Promise<void>;
  updateLoan: (loanId: string, updates: Partial<Loan>) => Promise<void>;
  flagReview: (reviewId: string, reason: string) => void;
  unflagReview: (reviewId: string) => Promise<void>;
  setCurrentView: (view: string) => void;
  setSelectedBook: (book: Book | null) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [loans, setLoans] = useState<Loan[]>(mockLoans);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [bookPage, setBookPage] = useState(0);
  const [bookPageSize] = useState(8);
  const [bookTotalElements, setBookTotalElements] = useState(mockBooks.length);
  const [bookTotalPages, setBookTotalPages] = useState(Math.max(1, Math.ceil(mockBooks.length / 8)));
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [currentView, setCurrentView] = useState("home");
  const [selectedBook, setSelectedBookState] = useState<Book | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshBooks = async () => {
    setBooksLoading(true);
    try {
      const status =
        availabilityFilter === "available"
          ? "ACTIVE"
          : availabilityFilter === "unavailable"
            ? "INACTIVE"
            : undefined;
      const page = await booksApi.list({
        page: bookPage,
        size: bookPageSize,
        sort: "title,asc",
        search: searchQuery,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        language: languageFilter === "all" ? undefined : languageFilter,
        status,
      });
      const mapped = page.content.map(bookFromBackend);
      setBooks(mapped);
      setBookTotalElements(page.totalElements);
      setBookTotalPages(Math.max(1, page.totalPages));
      setSelectedBookState((current) =>
        current ? mapped.find((book) => book.id === current.id) ?? current : current
      );
    } catch (err) {
      console.warn("[AppContext] No se pudieron cargar libros del backend:", err);
    } finally {
      setBooksLoading(false);
    }
  };

  const refreshFavorites = async () => {
    if (!getAuthToken()) return;
    try {
      const data = await favoritesApi.list();
      setFavorites(data.map((favorite) => String(favorite.bookId)));
    } catch (err) {
      console.warn("[AppContext] No se pudieron cargar favoritos:", err);
    }
  };

  const refreshReviewsForBook = async (bookId: string) => {
    try {
      const data = await reviewsApi.byBook(bookId);
      const mapped = data.map(reviewFromBackend);
      setReviews((prev) => [
        ...prev.filter((review) => review.bookId !== bookId),
        ...mapped,
      ]);
    } catch (err) {
      console.warn("[AppContext] No se pudieron cargar reseñas:", err);
    }
  };

  const refreshAdminReviews = async () => {
    if (currentUser?.role !== "admin") return;
    try {
      const data = await reviewsApi.list("VISIBLE");
      setReviews(
        data.map((review) => ({
          ...reviewFromBackend(review),
          flagged: true,
          flagReason: "Pendiente de moderación",
        }))
      );
    } catch (err) {
      console.warn("[AppContext] No se pudieron cargar reseñas para moderación:", err);
    }
  };

  const refreshLoans = async () => {
    if (!getAuthToken()) return;
    try {
      const data = currentUser?.role === "admin" ? await loansApi.listAll() : await loansApi.listMine();
      setLoans(data.map(loanFromBackend));
    } catch (err) {
      console.warn("[AppContext] No se pudieron cargar préstamos:", err);
    }
  };

  useEffect(() => {
    const token = restoreTokenFromStorage();
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as User;
        setCurrentUser(parsed);
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
        setAuthToken(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem(USER_STORAGE_KEY);
      setAuthToken(null);
      setCurrentUser(null);
      setFavorites([]);
      setLoans([]);
      setCurrentView("login");
    };
    window.addEventListener("bookworm:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("bookworm:unauthorized", handleUnauthorized);
  }, []);

  useEffect(() => {
    refreshBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookPage, bookPageSize, searchQuery, categoryFilter, languageFilter, availabilityFilter]);

  useEffect(() => {
    if (!currentUser) return;
    refreshFavorites();
    refreshLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, currentUser?.role]);

  const persistSession = (res: LoginResponse, email: string) => {
    const user = userFromBackend(res, email);
    setCurrentUser(user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.login({ email, password });
      persistSession(res, email);
      await refreshBooks();
      return true;
    } catch (err: any) {
      setAuthError(err?.message || "No se pudo iniciar sesión");
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (input: {
    name: string;
    email: string;
    password: string;
    gender: Gender;
    birthDate: string;
  }): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await authApi.register(input);
      return await login(input.email, input.password);
    } catch (err: any) {
      setAuthError(err?.message || "No se pudo registrar la cuenta");
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      setAuthToken(null);
    }
    localStorage.removeItem(USER_STORAGE_KEY);
    setCurrentUser(null);
    setFavorites([]);
    setLoans([]);
    setCurrentView("home");
    await refreshBooks();
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;
    const payload = {
      name: updates.name ?? currentUser.name,
      email: updates.email ?? currentUser.email,
    };
    const validationError = firstError(validateProfile(payload));
    if (validationError) throw new Error(validationError);
    const next = await usersApi.updateMe({
      name: payload.name.trim(),
      email: payload.email.trim(),
    });
    const mapped = userFromBackend(next);
    setCurrentUser(mapped);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mapped));
  };

  const changePassword = async (input: { currentPassword: string; newPassword: string }) => {
    await usersApi.changePassword(input);
  };

  const toggleFavorite = async (bookId: string) => {
    const validationError = firstError(validateLoan({ bookId }));
    if (validationError) throw new Error(validationError);
    const res = await favoritesApi.toggle(bookId);
    setFavorites((prev) =>
      res.favorite ? [...new Set([...prev, String(res.bookId)])] : prev.filter((id) => id !== String(res.bookId))
    );
  };

  const addReview = async (review: Omit<Review, "id" | "date">) => {
    const validationError = firstError(validateReview(review));
    if (validationError) throw new Error(validationError);
    const created = await reviewsApi.create({
      bookId: Number(review.bookId),
      rating: review.rating,
      comment: review.comment.trim(),
    });
    setReviews((prev) => [...prev.filter((r) => r.id !== String(created.id)), reviewFromBackend(created)]);
    await refreshBooks();
  };

  const deleteReview = (reviewId: string) => {
    const review = reviews.find((r) => r.id === reviewId);
    if (review) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setBooks((prev) =>
        prev.map((book) =>
          book.id === review.bookId ? { ...book, reviewCount: Math.max(0, book.reviewCount - 1) } : book
        )
      );
    }
  };

  const addBook = async (book: Omit<Book, "id">) => {
    const validationError = firstError(validateBook(book));
    if (validationError) throw new Error(validationError);
    const created = await booksApi.create(bookToUpsert(book));
    const finalBook = book.available
      ? created
      : await booksApi.updateStatus(created.id, "INACTIVE");
    setBooks((prev) => [...prev, bookFromBackend(finalBook)]);
  };

  const updateBook = async (bookId: string, updates: Partial<Book>) => {
    const current = books.find((book) => book.id === bookId);
    if (!current) return;

    if (updates.available !== undefined && Object.keys(updates).length === 1) {
      const updated = await booksApi.updateStatus(bookId, updates.available ? "ACTIVE" : "INACTIVE");
      const mapped = bookFromBackend(updated);
      setBooks((prev) => prev.map((book) => (book.id === bookId ? mapped : book)));
      return;
    }

    const nextBook = { ...current, ...updates };
    const validationError = firstError(validateBook(nextBook));
    if (validationError) throw new Error(validationError);
    const updated = await booksApi.update(bookId, bookToUpsert(nextBook));
    const finalBook =
      updates.available === undefined || updates.available === current.available
        ? updated
        : await booksApi.updateStatus(bookId, updates.available ? "ACTIVE" : "INACTIVE");
    const mapped = bookFromBackend(finalBook);
    setBooks((prev) => prev.map((book) => (book.id === bookId ? mapped : book)));
  };

  const deleteBook = (bookId: string) => {
    setBooks((prev) => prev.filter((book) => book.id !== bookId));
  };

  const addLoan = async (loan: Omit<Loan, "id">) => {
    const validationError = firstError(validateLoan(loan));
    if (validationError) throw new Error(validationError);
    const created = await loansApi.create(loan.bookId);
    setLoans((prev) => [loanFromBackend(created), ...prev]);
    await refreshBooks();
  };

  const updateLoan = async (loanId: string, updates: Partial<Loan>) => {
    if (updates.status === "returned") {
      const updated = await loansApi.returnLoan(loanId);
      setLoans((prev) => prev.map((loan) => (loan.id === loanId ? loanFromBackend(updated) : loan)));
      await refreshBooks();
      return;
    }
    setLoans((prev) => prev.map((loan) => (loan.id === loanId ? { ...loan, ...updates } : loan)));
  };

  const flagReview = (reviewId: string, reason: string) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId ? { ...review, flagged: true, flagReason: reason } : review
      )
    );
  };

  const unflagReview = async (reviewId: string) => {
    const hidden = await reviewsApi.hide(reviewId);
    setReviews((prev) =>
      prev.map((review) => (review.id === reviewId ? reviewFromBackend(hidden) : review))
    );
  };

  const setSelectedBook = (book: Book | null) => {
    setSelectedBookState(book);
    if (book) {
      booksApi.get(book.id).then((fresh) => setSelectedBookState(bookFromBackend(fresh))).catch(() => undefined);
      refreshReviewsForBook(book.id);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newTheme;
    });
  };

  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
    setBookPage(0);
  };

  const updateCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    setBookPage(0);
  };

  const updateLanguageFilter = (language: string) => {
    setLanguageFilter(language);
    setBookPage(0);
  };

  const updateRatingFilter = (rating: string) => {
    setRatingFilter(rating);
    setBookPage(0);
  };

  const updateAvailabilityFilter = (availability: string) => {
    setAvailabilityFilter(availability);
    setBookPage(0);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        books,
        reviews,
        loans,
        favorites,
        booksLoading,
        bookPage,
        bookPageSize,
        bookTotalElements,
        bookTotalPages,
        searchQuery,
        categoryFilter,
        languageFilter,
        ratingFilter,
        availabilityFilter,
        currentView,
        selectedBook,
        sidebarCollapsed,
        theme,
        authLoading,
        authError,
        login,
        register,
        logout,
        refreshBooks,
        refreshFavorites,
        refreshReviewsForBook,
        refreshAdminReviews,
        refreshLoans,
        updateProfile,
        changePassword,
        setSearchQuery: updateSearchQuery,
        setCategoryFilter: updateCategoryFilter,
        setLanguageFilter: updateLanguageFilter,
        setRatingFilter: updateRatingFilter,
        setAvailabilityFilter: updateAvailabilityFilter,
        setBookPage,
        toggleFavorite,
        addReview,
        deleteReview,
        addBook,
        updateBook,
        deleteBook,
        addLoan,
        updateLoan,
        flagReview,
        unflagReview,
        setCurrentView,
        setSelectedBook,
        toggleSidebar,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
