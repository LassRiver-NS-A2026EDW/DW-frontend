import { useApp } from "../context/AppContext";
import { Home, BookOpen, Heart, MessageSquare, User, LayoutDashboard, Menu, Library } from "lucide-react";
import logo from "../assets/logo.png";

export function Sidebar() {
  const { currentUser, currentView, setCurrentView, sidebarCollapsed, toggleSidebar } = useApp();

  const navigation = [
    { id: "home", label: "Inicio", icon: Home, roles: ["all"] },
    { id: "catalog", label: "Catálogo", icon: BookOpen, roles: ["all"] },
    { id: "favorites", label: "Favoritos", icon: Heart, roles: ["user", "librarian", "admin"] },
    { id: "loans", label: "Préstamos", icon: Library, roles: ["user", "librarian", "admin"] },
    { id: "reviews", label: "Reseñas", icon: MessageSquare, roles: ["user", "librarian", "admin"] },
    { id: "profile", label: "Perfil", icon: User, roles: ["user", "librarian", "admin"] },
    { id: "admin", label: "Administración", icon: LayoutDashboard, roles: ["admin", "librarian"] },
  ];

  const canAccess = (roles: string[]) => {
    if (roles.includes("all")) return true;
    if (!currentUser) return false;
    return roles.includes(currentUser.role);
  };

  return (
    <div
      className={`${
        sidebarCollapsed ? "w-20" : "w-64"
      } h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300`}
    >
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-1">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="LassRiver NS"
                className="h-12 w-auto transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors ml-auto"
          >
            <Menu className="h-5 w-5 text-sidebar-foreground" />
          </button>
        </div>
        {!sidebarCollapsed && (
          <p className="text-xs text-muted-foreground mt-2">Biblioteca Digital Premium</p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          if (!canAccess(item.roles)) return null;
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {!sidebarCollapsed && currentUser && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-3 bg-sidebar-accent rounded-lg">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">{currentUser.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
