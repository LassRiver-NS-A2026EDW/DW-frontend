import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Heart, LogIn } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { RatingStars } from "../components/RatingStars";

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

  const handleBookClick = (book: any) => {
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
              <Card
                key={book.id}
                className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onClick={() => handleBookClick(book)}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteToggle(book.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-full hover:scale-110 active:scale-95 transition-transform duration-200"
                    aria-label="Quitar de favoritos"
                  >
                    <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                  </button>
                </div>
                <CardContent className="p-4" onClick={() => handleBookClick(book)}>
                  <h3 className="font-medium text-foreground line-clamp-2 mb-1">{book.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{book.author}</p>
                  <div className="mb-3">
                    <RatingStars rating={book.rating} readonly size="sm" showLabel />
                    <span className="text-xs text-muted-foreground ml-1">({book.reviewCount})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{book.category}</Badge>
                    <Badge variant="outline">{book.language}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
