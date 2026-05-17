import { useApp } from "../context/AppContext";
import { Bell, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";

export function Topbar() {
  const { currentUser, currentView, theme, toggleTheme, logout, setCurrentView } = useApp();

  const titles: Record<string, string> = {
    home: "Inicio",
    catalog: "Catálogo",
    "book-detail": "Detalle del libro",
    favorites: "Favoritos",
    reviews: "Reseñas",
    profile: "Perfil",
    admin: "Administración",
  };

  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center gap-3 min-w-0">
        <h2 className="text-lg font-semibold text-foreground truncate">
          {titles[currentView] ?? "LassRiver NS"}
        </h2>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="transition-transform duration-200 hover:scale-110"
          aria-label="Cambiar tema"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="transition-transform duration-200 hover:scale-110"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5" />
        </Button>

        {currentUser ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="transition-transform duration-200 hover:scale-110"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => setCurrentView("login")}
            className="transition-transform duration-200 hover:scale-[1.03]"
          >
            Iniciar sesión
          </Button>
        )}
      </div>
    </div>
  );
}
