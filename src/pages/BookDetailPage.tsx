import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Heart, Calendar, BookOpen, Globe, Building2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { RatingStars } from "../components/RatingStars";
import { StatusBadge } from "../components/StatusBadge";
import { BookDetailSkeleton } from "../components/LoadingSkeleton";
import { EmptyState } from "../components/EmptyState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AuthRequiredDialog } from "../components/AuthRequiredDialog";
import { firstError, validateLoan, validateReview } from "../utils/validation";

export function BookDetail() {
  const {
    selectedBook,
    reviews,
    favorites,
    currentUser,
    toggleFavorite,
    addReview,
    addLoan,
    deleteReview,
    setCurrentView,
  } = useApp();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authAction, setAuthAction] = useState<string>("");

  if (!selectedBook) {
    setCurrentView("catalog");
    return null;
  }

  const bookReviews = reviews.filter((r) => r.bookId === selectedBook.id);
  const userReview = bookReviews.find((r) => r.userId === currentUser?.id);

  const requireAuth = (action: string) => {
    setAuthAction(action);
    setAuthDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!currentUser) {
      requireAuth("escribir una reseña");
      return;
    }
    if (!comment.trim()) {
      toast.error("Por favor escribe un comentario");
      return;
    }
    if (comment.length > 2000) {
      toast.error("El comentario no puede superar los 2000 caracteres");
      return;
    }
    const validationError = firstError(
      validateReview({
        bookId: selectedBook.id,
        rating,
        comment,
      })
    );
    if (validationError) {
      toast.error(validationError);
      return;
    }
    try {
      await addReview({
        bookId: selectedBook.id,
        userId: currentUser.id,
        userName: currentUser.name,
        rating,
        comment: comment.trim(),
        flagged: false,
      });
      setComment("");
      setRating(5);
      toast.success("Resena publicada correctamente");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo publicar la resena");
    }
  };

  const confirmDeleteReview = () => {
    if (userReview) {
      deleteReview(userReview.id);
      toast.success("Reseña eliminada correctamente");
    }
    setConfirmDeleteOpen(false);
  };

  const handleFavoriteToggle = async () => {
    if (!currentUser) {
      requireAuth("agregar libros a favoritos");
      return;
    }
    const isFavorite = favorites.includes(selectedBook.id);
    try {
      await toggleFavorite(selectedBook.id);
      toast.success(isFavorite ? "Removido de favoritos" : "Agregado a favoritos");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo actualizar favoritos");
    }
  };

  const handleReserve = async () => {
    if (!currentUser) {
      requireAuth("reservar libros");
      return;
    }
    const validationError = firstError(validateLoan({ bookId: selectedBook.id }));
    if (validationError) {
      toast.error(validationError);
      return;
    }
    try {
      await addLoan({
        bookId: selectedBook.id,
        bookTitle: selectedBook.title,
        userId: currentUser.id,
        userName: currentUser.name,
        loanDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        status: "active",
      });
      toast.success("Libro reservado correctamente");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo reservar el libro");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <Button variant="ghost" onClick={() => setCurrentView("catalog")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al catálogo
          </Button>
          <BookDetailSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => setCurrentView("catalog")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al catálogo
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="overflow-hidden sticky top-6">
              <div className="aspect-[3/4] bg-muted">
                <img
                  src={selectedBook.coverUrl}
                  alt={selectedBook.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4 space-y-3">
                <Button
                  className="w-full"
                  variant={favorites.includes(selectedBook.id) ? "secondary" : "default"}
                  onClick={handleFavoriteToggle}
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${
                      favorites.includes(selectedBook.id) ? "fill-current" : ""
                    }`}
                  />
                  {favorites.includes(selectedBook.id) ? "En Favoritos" : "Agregar a Favoritos"}
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={!selectedBook.available}
                  onClick={handleReserve}
                >
                  {selectedBook.available ? "Reservar Libro" : "No Disponible"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{selectedBook.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">{selectedBook.author}</p>

              <div className="flex items-center gap-4 mb-6">
                <RatingStars rating={selectedBook.rating} readonly size="lg" showLabel />
                <span className="text-sm text-muted-foreground">
                  ({selectedBook.reviewCount} reseñas)
                </span>
                <StatusBadge status={selectedBook.available ? "available" : "unavailable"} />
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="default">{selectedBook.category}</Badge>
                <Badge variant="secondary">{selectedBook.language}</Badge>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Libro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Editorial</p>
                      <p className="text-sm text-muted-foreground">{selectedBook.publisher}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Fecha de Publicación</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedBook.publishDate).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Páginas</p>
                      <p className="text-sm text-muted-foreground">{selectedBook.pages}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">ISBN</p>
                      <p className="text-sm text-muted-foreground">{selectedBook.isbn}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{selectedBook.description}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Reseñas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentUser && !userReview && (
                  <div className="space-y-4 p-6 bg-muted/30 rounded-xl border border-border">
                    <div>
                      <label className="text-sm font-medium mb-3 block">Tu Calificación</label>
                      <RatingStars
                        rating={rating}
                        onRatingChange={setRating}
                        size="lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Tu Reseña ({comment.length}/2000)
                      </label>
                      <Textarea
                        placeholder="Comparte tu opinión sobre este libro..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value.slice(0, 2000))}
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleSubmitReview}>Publicar Reseña</Button>
                  </div>
                )}

                {!currentUser && (
                  <EmptyState
                    icon={LogIn}
                    title="Inicia sesión para escribir reseñas"
                    description="Comparte tu opinión sobre este libro con la comunidad"
                    actionLabel="Iniciar Sesión"
                    onAction={() => setCurrentView("login")}
                  />
                )}

                <div className="space-y-4">
                  {bookReviews.map((review) => (
                    <div key={review.id} className="p-5 bg-card border border-border rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{review.userName}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <RatingStars rating={review.rating} readonly size="sm" />
                            <span className="text-xs text-muted-foreground">{review.date}</span>
                          </div>
                        </div>
                        {currentUser?.id === review.userId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDeleteOpen(true)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                  {bookReviews.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No hay reseñas aún. Sé el primero en escribir una.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="¿Eliminar reseña?"
        description="Esta acción no se puede deshacer. Tu reseña será eliminada permanentemente."
        confirmLabel="Eliminar"
        destructive
        onConfirm={confirmDeleteReview}
      />

      <AuthRequiredDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        action={authAction}
      />
    </div>
  );
}
