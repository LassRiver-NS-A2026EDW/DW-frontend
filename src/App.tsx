import { useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Sidebar } from "./layouts/Sidebar";
import { Topbar } from "./layouts/Topbar";
import { Login } from "./pages/LoginPage";
import { Register } from "./pages/RegisterPage";
import { Home } from "./pages/HomePage";
import { Catalog } from "./pages/CatalogPage";
import { BookDetail } from "./pages/BookDetailPage";
import { BookReader } from "./pages/BookReaderPage";
import { Favorites } from "./pages/FavoritesPage";
import { Loans } from "./pages/LoansPage";
import { Reviews } from "./pages/ReviewsPage";
import { Profile } from "./pages/ProfilePage";
import { Admin } from "./pages/AdminPage";
import { Toaster } from "./components/ui/sonner";

function AppContent() {
  const { currentView } = useApp();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  if (currentView === "login") {
    return <Login />;
  }

  if (currentView === "register") {
    return <Register />;
  }

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
        {currentView !== "book-reader" && <Topbar />}
        {currentView === "home" && <Home />}
        {currentView === "catalog" && <Catalog />}
        {currentView === "book-detail" && <BookDetail />}
        {currentView === "book-reader" && <BookReader />}
        {currentView === "favorites" && <Favorites />}
        {currentView === "loans" && <Loans />}
        {currentView === "reviews" && <Reviews />}
        {currentView === "profile" && <Profile />}
        {currentView === "admin" && <Admin />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster />
    </AppProvider>
  );
}
