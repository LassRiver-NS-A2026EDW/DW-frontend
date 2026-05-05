import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, Book, Review, Loan, mockBooks, mockReviews, mockUsers, mockLoans } from "../data/mockData";

interface AppContextType {
  currentUser: User | null;
  books: Book[];
  reviews: Review[];
  loans: Loan[];
  favorites: string[];
  searchQuery: string;
  categoryFilter: string;
  languageFilter: string;
  ratingFilter: string;
  availabilityFilter: string;
  currentView: string;
  selectedBook: Book | null;
  sidebarCollapsed: boolean;
  theme: "light" | "dark";
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (user: Partial<User>) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setLanguageFilter: (language: string) => void;
  setRatingFilter: (rating: string) => void;
  setAvailabilityFilter: (availability: string) => void;
  toggleFavorite: (bookId: string) => void;
  addReview: (review: Omit<Review, "id" | "date">) => void;
  deleteReview: (reviewId: string) => void;
  addBook: (book: Omit<Book, "id">) => void;
  updateBook: (bookId: string, updates: Partial<Book>) => void;
  deleteBook: (bookId: string) => void;
  addLoan: (loan: Omit<Loan, "id">) => void;
  updateLoan: (loanId: string, updates: Partial<Loan>) => void;
  flagReview: (reviewId: string, reason: string) => void;
  unflagReview: (reviewId: string) => void;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [currentView, setCurrentView] = useState("home");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const login = (email: string, password: string): boolean => {
    const user = mockUsers.find((u) => u.email === email);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, password: string): boolean => {
    if (mockUsers.find((u) => u.email === email)) {
      return false;
    }
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      role: "user",
    };
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView("home");
  };

  const updateProfile = (updates: Partial<User>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };

  const toggleFavorite = (bookId: string) => {
    setFavorites((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const addReview = (review: Omit<Review, "id" | "date">) => {
    const newReview: Review = {
      ...review,
      id: `r${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      flagged: false,
    };
    setReviews((prev) => [...prev, newReview]);
    setBooks((prev) =>
      prev.map((book) =>
        book.id === review.bookId
          ? { ...book, reviewCount: book.reviewCount + 1 }
          : book
      )
    );
  };

  const deleteReview = (reviewId: string) => {
    const review = reviews.find((r) => r.id === reviewId);
    if (review) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setBooks((prev) =>
        prev.map((book) =>
          book.id === review.bookId
            ? { ...book, reviewCount: Math.max(0, book.reviewCount - 1) }
            : book
        )
      );
    }
  };

  const addBook = (book: Omit<Book, "id">) => {
    const newBook: Book = {
      ...book,
      id: `b${Date.now()}`,
    };
    setBooks((prev) => [...prev, newBook]);
  };

  const updateBook = (bookId: string, updates: Partial<Book>) => {
    setBooks((prev) =>
      prev.map((book) => (book.id === bookId ? { ...book, ...updates } : book))
    );
  };

  const deleteBook = (bookId: string) => {
    setBooks((prev) => prev.filter((book) => book.id !== bookId));
  };

  const addLoan = (loan: Omit<Loan, "id">) => {
    const newLoan: Loan = {
      ...loan,
      id: `l${Date.now()}`,
    };
    setLoans((prev) => [...prev, newLoan]);
    updateBook(loan.bookId, { available: false });
  };

  const updateLoan = (loanId: string, updates: Partial<Loan>) => {
    setLoans((prev) =>
      prev.map((loan) => (loan.id === loanId ? { ...loan, ...updates } : loan))
    );
    if (updates.status === "returned") {
      const loan = loans.find((l) => l.id === loanId);
      if (loan) {
        updateBook(loan.bookId, { available: true });
      }
    }
  };

  const flagReview = (reviewId: string, reason: string) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId ? { ...review, flagged: true, flagReason: reason } : review
      )
    );
  };

  const unflagReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId ? { ...review, flagged: false, flagReason: undefined } : review
      )
    );
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

  return (
    <AppContext.Provider
      value={{
        currentUser,
        books,
        reviews,
        loans,
        favorites,
        searchQuery,
        categoryFilter,
        languageFilter,
        ratingFilter,
        availabilityFilter,
        currentView,
        selectedBook,
        sidebarCollapsed,
        theme,
        login,
        register,
        logout,
        updateProfile,
        setSearchQuery,
        setCategoryFilter,
        setLanguageFilter,
        setRatingFilter,
        setAvailabilityFilter,
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
