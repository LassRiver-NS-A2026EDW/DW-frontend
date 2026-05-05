import { useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { Login } from "./components/views/Login";
import { Register } from "./components/views/Register";
import { Home } from "./components/views/Home";
import { Catalog } from "./components/views/Catalog";
import { BookDetail } from "./components/views/BookDetail";
import { Favorites } from "./components/views/Favorites";
import { Reviews } from "./components/views/Reviews";
import { Profile } from "./components/views/Profile";
import { Admin } from "./components/views/Admin";
import { Toaster } from "./components/ui/sonner";

function AppContent() {
  const { currentView, currentUser } = useApp();

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
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        {currentView === "home" && <Home />}
        {currentView === "catalog" && <Catalog />}
        {currentView === "book-detail" && <BookDetail />}
        {currentView === "favorites" && <Favorites />}
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