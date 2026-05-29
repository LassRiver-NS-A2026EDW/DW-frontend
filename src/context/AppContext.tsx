import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Gender, LoginResponse } from "../api/auth";
import { authApi } from "../api/auth";
import { booksApi, type ListBooksParams } from "../api/books";
import { favoritesApi } from "../api/favorites";
import { loansApi, type LoanRenewalResponse } from "../api/loans";
import { reservationsApi } from "../api/reservations";
import { reviewsApi } from "../api/reviews";
import { usersApi } from "../api/users";
import {
  getApiErrorMessage,
  getAuthToken,
  restoreTokenFromStorage,
  setAuthToken,
} from "../api/http";
import {
  bookFromBackend,
  bookToUpsert,
  loanFromBackend,
  reservationFromBackend,
  reviewFromBackend,
  userFromBackend,
} from "../api/mappers";
import { queryKeys } from "../hooks/queryKeys";
import {
  useAdminReviewsQuery,
  useBookFacetsQuery,
  useBooksQuery,
  useFavoritesQuery,
  useLoansQuery,
  useReservationsQuery,
} from "../hooks/useLibraryQueries";
import { Book, Loan, mockBooks, mockLoans, mockReviews, Reservation, Review, User } from "../mocks/mockData";
import { firstError, validateBook, validateLoan, validateProfile, validateReview } from "../utils/validation";

const USER_STORAGE_KEY = "lassriver.auth.user";

interface AppContextType {
  currentUser: User | null;
  books: Book[];
  bookCategories: string[];
  bookLanguages: string[];
  reviews: Review[];
  loans: Loan[];
  reservations: Reservation[];
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
  refreshBookFacets: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
  refreshReviewsForBook: (bookId: string) => Promise<void>;
  refreshAdminReviews: () => Promise<void>;
  refreshLoans: () => Promise<void>;
  refreshReservations: () => Promise<void>;
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
  addBook: (book: Omit<Book, "id">) => Promise<Book>;
  updateBook: (bookId: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (bookId: string) => void;
  uploadBookPdf: (bookId: string, file: File) => Promise<void>;
  downloadBookPdf: (bookId: string, url: string) => Promise<void>;
  addLoan: (loan: Omit<Loan, "id">, durationMinutes: number) => Promise<void>;
  updateLoan: (loanId: string, updates: Partial<Loan>) => Promise<void>;
  renewLoan: (loanId: string, durationMinutes: number) => Promise<void>;
  getLoanHistory: (loanId: string) => Promise<LoanRenewalResponse[]>;
  createReservation: (bookId: string, durationMinutes: number) => Promise<void>;
  cancelReservation: (reservationId: string) => Promise<void>;
  createBookCopy: (bookId: string) => Promise<void>;
  deleteBookCopy: (bookId: string, copyId: string) => Promise<void>;
  flagReview: (reviewId: string, reason: string) => void;
  hideReview: (reviewId: string) => Promise<void>;
  keepReviewVisible: (reviewId: string) => Promise<void>;
  unflagReview: (reviewId: string) => Promise<void>;
  setCurrentView: (view: string) => void;
  setSelectedBook: (book: Book | null) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [bookPage, setBookPage] = useState(0);
  const [bookPageSize] = useState(8);
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

  const canManageLibrary = currentUser?.role === "admin" || currentUser?.role === "librarian";
  const authenticated = Boolean(currentUser && getAuthToken());

  const bookQueryParams = useMemo<ListBooksParams>(() => {
    const availability =
      availabilityFilter === "available"
        ? "available"
        : availabilityFilter === "unavailable"
          ? "unavailable"
          : undefined;

    return {
      page: bookPage,
      size: bookPageSize,
      sort: "title,asc",
      search: searchQuery,
      category: categoryFilter === "all" ? undefined : categoryFilter,
      language: languageFilter === "all" ? undefined : languageFilter,
      availability,
    };
  }, [availabilityFilter, bookPage, bookPageSize, categoryFilter, languageFilter, searchQuery]);

  const booksQuery = useBooksQuery(bookQueryParams);
  const facetsQuery = useBookFacetsQuery();
  const favoritesQuery = useFavoritesQuery(authenticated);
  const loansQuery = useLoansQuery(Boolean(canManageLibrary), authenticated);
  const reservationsQuery = useReservationsQuery(authenticated);
  const adminReviewsQuery = useAdminReviewsQuery(Boolean(canManageLibrary && authenticated));

  const books = booksQuery.data?.content ?? (booksQuery.isError ? mockBooks : []);
  const favorites = favoritesQuery.data ?? [];
  const loans = loansQuery.data ?? mockLoans;
  const reservations = reservationsQuery.data ?? [];
  const bookCategories =
    facetsQuery.data?.categories ?? (facetsQuery.isError ? Array.from(new Set(mockBooks.map((book) => book.category))).sort() : []);
  const bookLanguages =
    facetsQuery.data?.languages ?? (facetsQuery.isError ? Array.from(new Set(mockBooks.map((book) => book.language))).sort() : []);

  useEffect(() => {
    const token = restoreTokenFromStorage();
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (token && storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser) as User);
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
        setAuthToken(null);
      }
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem(USER_STORAGE_KEY);
      setAuthToken(null);
      setCurrentUser(null);
      queryClient.removeQueries({ queryKey: queryKeys.favorites });
      queryClient.removeQueries({ queryKey: ["loans"] });
      queryClient.removeQueries({ queryKey: queryKeys.reservations });
      queryClient.removeQueries({ queryKey: queryKeys.notifications.all });
      setCurrentView("login");
    };
    window.addEventListener("bookworm:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("bookworm:unauthorized", handleUnauthorized);
  }, [queryClient]);

  useEffect(() => {
    if (adminReviewsQuery.data && canManageLibrary) {
      setReviews((current) => replacePersistedReviews(current, adminReviewsQuery.data));
    }
  }, [adminReviewsQuery.data, canManageLibrary]);

  useEffect(() => {
    if (!selectedBook || books.length === 0) return;
    const freshBook = books.find((book) => book.id === selectedBook.id);
    if (freshBook && freshBook !== selectedBook) {
      setSelectedBookState(freshBook);
    }
  }, [books, selectedBook]);

  const invalidateBooks = async () => {
    await queryClient.invalidateQueries({ queryKey: ["books"] });
  };

  const refreshBooks = async () => {
    await invalidateBooks();
  };

  const refreshBookFacets = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.bookFacets });
  };

  const refreshFavorites = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
  };

  const refreshLoans = async () => {
    await queryClient.invalidateQueries({ queryKey: ["loans"] });
  };

  const refreshReservations = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.reservations });
  };

  const refreshNotifications = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  };

  const refreshAdminReviews = async () => {
    const data = await queryClient.fetchQuery({
      queryKey: queryKeys.adminReviews,
      queryFn: async () => {
        const response = await reviewsApi.list("ALL");
        return response.map(reviewFromBackend);
      },
    });
    setReviews((current) => replacePersistedReviews(current, data));
  };

  const refreshReviewsForBook = async (bookId: string) => {
    const data = await queryClient.fetchQuery({
      queryKey: queryKeys.reviewsByBook(bookId),
      queryFn: async () => {
        const response = await reviewsApi.byBook(bookId);
        return response.map(reviewFromBackend);
      },
    });
    setReviews((current) => [...current.filter((review) => review.bookId !== bookId), ...data]);
  };

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
      await invalidateBooks();
      return true;
    } catch (err: any) {
      const message = getApiErrorMessage(err, "No se pudo iniciar sesion");
      setAuthError(message);
      throw new Error(message);
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
      const message = getApiErrorMessage(err, "No se pudo registrar la cuenta");
      setAuthError(message);
      throw new Error(message);
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
    queryClient.removeQueries({ queryKey: queryKeys.favorites });
    queryClient.removeQueries({ queryKey: ["loans"] });
    queryClient.removeQueries({ queryKey: queryKeys.reservations });
    queryClient.removeQueries({ queryKey: queryKeys.notifications.all });
    setCurrentView("home");
    await invalidateBooks();
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
    await favoritesApi.toggle(bookId);
    await refreshFavorites();
  };

  const addReview = async (review: Omit<Review, "id" | "date">) => {
    const validationError = firstError(validateReview(review));
    if (validationError) throw new Error(validationError);
    const created = await reviewsApi.create({
      bookId: Number(review.bookId),
      rating: review.rating,
      comment: review.comment.trim(),
    });
    setReviews((current) => mergeReviews(current, [reviewFromBackend(created)]));
    await Promise.all([invalidateBooks(), refetchSelectedBook(String(review.bookId))]);
  };

  const deleteReview = (reviewId: string) => {
    const review = reviews.find((item) => item.id === reviewId);
    if (!review) return;
    setReviews((current) => current.filter((item) => item.id !== reviewId));
    queryClient.setQueriesData({ queryKey: ["books"] }, (data: any) => {
      if (!data?.content) return data;
      return {
        ...data,
        content: data.content.map((book: Book) =>
          book.id === review.bookId ? { ...book, reviewCount: Math.max(0, book.reviewCount - 1) } : book
        ),
      };
    });
  };

  const addBook = async (book: Omit<Book, "id">): Promise<Book> => {
    const validationError = firstError(validateBook(book));
    if (validationError) throw new Error(validationError);
    const created = await booksApi.create(bookToUpsert(book));
    const finalBook = book.available ? created : await booksApi.updateStatus(created.id, "INACTIVE");
    await Promise.all([invalidateBooks(), refreshBookFacets()]);
    return bookFromBackend(finalBook);
  };

  const updateBook = async (bookId: string, updates: Partial<Book>) => {
    const current = books.find((book) => book.id === bookId);
    if (!current) return;

    if (updates.available !== undefined && Object.keys(updates).length === 1) {
      await booksApi.updateStatus(bookId, updates.available ? "ACTIVE" : "INACTIVE");
      await invalidateBooks();
      return;
    }

    const nextBook = { ...current, ...updates };
    const validationError = firstError(validateBook(nextBook));
    if (validationError) throw new Error(validationError);
    await booksApi.update(bookId, bookToUpsert(nextBook));
    if (updates.available !== undefined && updates.available !== current.available) {
      await booksApi.updateStatus(bookId, updates.available ? "ACTIVE" : "INACTIVE");
    }
    await Promise.all([invalidateBooks(), refreshBookFacets()]);
  };

  const deleteBook = async (bookId: string) => {
    queryClient.setQueriesData({ queryKey: ["books"] }, (data: any) => {
      if (!data?.content) return data;
      return { ...data, content: data.content.filter((book: Book) => book.id !== bookId) };
    });
  };

  const uploadBookPdf = async (bookId: string, file: File) => {
    await booksApi.uploadPdf(bookId, file);
    await refetchSelectedBook(bookId);
    await invalidateBooks();
  };

  const downloadBookPdf = async (bookId: string, url: string) => {
    await booksApi.downloadPdf(bookId, url);
    await refetchSelectedBook(bookId);
    await invalidateBooks();
  };

  const addLoan = async (loan: Omit<Loan, "id">, durationMinutes: number) => {
    const validationError = firstError(validateLoan({ ...loan, durationMinutes }));
    if (validationError) throw new Error(validationError);
    await loansApi.create(loan.bookId, durationMinutes);
    await Promise.all([
      refreshLoans(),
      refreshReservations(),
      refreshNotifications(),
      invalidateBooks(),
      refetchSelectedBook(loan.bookId),
    ]);
  };

  const updateLoan = async (loanId: string, updates: Partial<Loan>) => {
    if (updates.status === "returned") {
      const returnedLoan = await loansApi.returnLoan(loanId);
      await Promise.all([
        refreshLoans(),
        refreshReservations(),
        refreshNotifications(),
        invalidateBooks(),
        refetchSelectedBook(String(returnedLoan.bookId)),
      ]);
    }
  };

  const renewLoan = async (loanId: string, durationMinutes: number) => {
    const validationError = firstError(validateLoan({ bookId: 1, durationMinutes }));
    if (validationError) throw new Error(validationError);
    await loansApi.renew(loanId, durationMinutes);
    await Promise.all([refreshLoans(), refreshNotifications()]);
  };

  const getLoanHistory = async (loanId: string) => loansApi.history(loanId);

  const createReservation = async (bookId: string, durationMinutes: number) => {
    const validationError = firstError(validateLoan({ bookId, durationMinutes }));
    if (validationError) throw new Error(validationError);
    await reservationsApi.create(bookId, durationMinutes);
    await Promise.all([refreshReservations(), refreshNotifications(), invalidateBooks(), refetchSelectedBook(bookId)]);
  };

  const cancelReservation = async (reservationId: string) => {
    const cancelledReservation = await reservationsApi.cancel(reservationId);
    await Promise.all([
      refreshReservations(),
      refreshNotifications(),
      invalidateBooks(),
      refetchSelectedBook(String(cancelledReservation.bookId)),
    ]);
  };

  const createBookCopy = async (bookId: string) => {
    await booksApi.createCopy(bookId);
    await Promise.all([invalidateBooks(), refetchSelectedBook(bookId)]);
  };

  const deleteBookCopy = async (bookId: string, copyId: string) => {
    await booksApi.deleteCopy(bookId, copyId);
    await Promise.all([invalidateBooks(), refetchSelectedBook(bookId)]);
  };

  const flagReview = (reviewId: string, reason: string) => {
    setReviews((current) =>
      current.map((review) => (review.id === reviewId ? { ...review, flagged: true, flagReason: reason } : review))
    );
  };

  const hideReview = async (reviewId: string) => {
    const hidden = await reviewsApi.hide(reviewId);
    setReviews((current) => mergeReviews(current, [reviewFromBackend(hidden)]));
    await Promise.all([refreshAdminReviews(), invalidateBooks(), refetchSelectedBook(String(hidden.bookId))]);
  };

  const keepReviewVisible = async (reviewId: string) => {
    const visible = await reviewsApi.show(reviewId);
    setReviews((current) => mergeReviews(current, [{ ...reviewFromBackend(visible), flagged: false }]));
    await Promise.all([refreshAdminReviews(), invalidateBooks(), refetchSelectedBook(String(visible.bookId))]);
  };

  const unflagReview = keepReviewVisible;

  const refetchSelectedBook = async (bookId: string) => {
    const fresh = await queryClient.fetchQuery({
      queryKey: queryKeys.book(bookId),
      queryFn: async () => bookFromBackend(await booksApi.get(bookId)),
    });
    setSelectedBookState((current) => (current?.id === bookId ? fresh : current));
  };

  const setSelectedBook = (book: Book | null) => {
    setSelectedBookState(book);
    if (!book) return;
    refetchSelectedBook(book.id).catch(() => undefined);
    refreshReviewsForBook(book.id).catch(() => undefined);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((current) => !current);
  };

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
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
        bookCategories,
        bookLanguages,
        reviews,
        loans,
        reservations,
        favorites,
        booksLoading: booksQuery.isLoading || booksQuery.isFetching,
        bookPage,
        bookPageSize,
        bookTotalElements: booksQuery.data?.totalElements ?? (booksQuery.isError ? mockBooks.length : 0),
        bookTotalPages: Math.max(
          1,
          booksQuery.data?.totalPages ?? (booksQuery.isError ? Math.ceil(mockBooks.length / bookPageSize) : 1)
        ),
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
        refreshBookFacets,
        refreshFavorites,
        refreshReviewsForBook,
        refreshAdminReviews,
        refreshLoans,
        refreshReservations,
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
        uploadBookPdf,
        downloadBookPdf,
        addLoan,
        updateLoan,
        renewLoan,
        getLoanHistory,
        createReservation,
        cancelReservation,
        createBookCopy,
        deleteBookCopy,
        flagReview,
        hideReview,
        keepReviewVisible,
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

function mergeReviews(current: Review[], incoming: Review[]) {
  const incomingIds = new Set(incoming.map((review) => review.id));
  return [...current.filter((review) => !incomingIds.has(review.id)), ...incoming];
}

function replacePersistedReviews(current: Review[], incoming: Review[]) {
  return [...current.filter((review) => !isPersistedReviewId(review.id)), ...incoming];
}

function isPersistedReviewId(reviewId: string) {
  return /^\d+$/.test(reviewId);
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
