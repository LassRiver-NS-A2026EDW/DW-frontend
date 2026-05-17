import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { MessageSquare, LogIn } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { RatingStars } from "../components/RatingStars";

export function Reviews() {
  const { currentUser, reviews, books, setCurrentView, setSelectedBook } = useApp();

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <EmptyState
          icon={LogIn}
          title="Acceso Restringido"
          description="Debes iniciar sesión para ver y gestionar tus reseñas"
          actionLabel="Iniciar Sesión"
          onAction={() => setCurrentView("login")}
        />
      </div>
    );
  }

  const userReviews = reviews.filter((r) => r.userId === currentUser.id);

  const handleBookClick = (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    if (book) {
      setSelectedBook(book);
      setCurrentView("book-detail");
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Mis Reseñas</h1>
          <p className="text-muted-foreground">
            {userReviews.length} {userReviews.length === 1 ? "reseña publicada" : "reseñas publicadas"}
          </p>
        </div>

        {userReviews.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No has escrito reseñas aún"
            description="Explora el catálogo y comparte tus opiniones sobre los libros que has leído"
            actionLabel="Ir al Catálogo"
            onAction={() => setCurrentView("catalog")}
          />
        ) : (
          <div className="grid gap-6">
            {userReviews.map((review) => {
              const book = books.find((b) => b.id === review.bookId);
              if (!book) return null;

              return (
                <Card key={review.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle
                          className="cursor-pointer hover:text-primary transition-colors text-lg"
                          onClick={() => handleBookClick(book.id)}
                        >
                          {book.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">{book.author}</p>
                      </div>
                      <RatingStars rating={review.rating} readonly size="md" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{review.date}</Badge>
                      {review.flagged && (
                        <Badge variant="destructive">Marcada por moderación</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
