import { useApp } from "../context/AppContext";
import { Heart, LogIn } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { BookCard } from "../components/catalog/BookCard";
import type { Book } from "../mocks/mockData";

export function Favorites() {
  const {
    books,
    favorites,
    toggleFavorite,
    setSelectedBook,
    setCurrentView,
    currentUser,
  } = useApp();

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <EmptyState
          icon={LogIn}
          title="Acceso Restringido"
          description="Debes iniciar sesión para ver tus libros favoritos"
          actionLabel="Iniciar Sesión"
          onAction={() => setCurrentView("login")}
        />
      </div>
    );
  }

  const favoriteBooks = books.filter((book) => favorites.includes(book.id));

  const handleFavoriteToggle = async (bookId: string) => {
    try {
      await toggleFavorite(bookId);
      toast.success("Removido de favoritos");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo actualizar favoritos");
    }
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setCurrentView("book-detail");
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Mis Favoritos</h1>
          <p className="text-muted-foreground">
            {favoriteBooks.length} {favoriteBooks.length === 1 ? "libro guardado" : "libros guardados"}
          </p>
        </div>

        {favoriteBooks.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No tienes favoritos aún"
            description="Explora el catálogo y guarda tus libros favoritos para acceder a ellos fácilmente"
            actionLabel="Ir al Catálogo"
            onAction={() => setCurrentView("catalog")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isFavorite
                onOpen={handleBookClick}
                onToggleFavorite={handleFavoriteToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
