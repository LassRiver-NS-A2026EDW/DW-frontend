import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { BookDetailSkeleton } from "../components/LoadingSkeleton";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AuthRequiredDialog } from "../components/AuthRequiredDialog";
import { BookActionPanel } from "../components/book-detail/BookActionPanel";
import { BookOverview } from "../components/book-detail/BookOverview";
import { ReviewSection } from "../components/book-detail/ReviewSection";
import { firstError, validateLoan, validateReview } from "../utils/validation";

export function BookDetail() {
  const {
    selectedBook,
    reviews,
    loans,
    favorites,
    currentUser,
    toggleFavorite,
    addReview,
    addLoan,
    updateLoan,
    deleteReview,
    reservations,
    createReservation,
    setCurrentView,
  } = useApp();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loanDurationMinutes, setLoanDurationMinutes] = useState(1440);
  const [loading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authAction, setAuthAction] = useState("");

  if (!selectedBook) {
    setCurrentView("catalog");
    return null;
  }

  const bookReviews = reviews.filter((review) => review.bookId === selectedBook.id);
  const userReview = bookReviews.find((review) => review.userId === currentUser?.id);
  const activeLoan = loans.find(
    (loan) =>
      loan.bookId === selectedBook.id &&
      loan.userId === currentUser?.id &&
      (loan.status === "active" || loan.status === "overdue")
  );
  const waitingReservation = reservations.find(
    (reservation) =>
      reservation.bookId === selectedBook.id &&
      reservation.userId === currentUser?.id &&
      reservation.status === "waiting"
  );

  const requireAuth = (action: string) => {
    setAuthAction(action);
    setAuthDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!currentUser) {
      requireAuth("escribir una resena");
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
      toast.success("Resena eliminada correctamente");
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

    const validationError = firstError(validateLoan({ bookId: selectedBook.id, durationMinutes: loanDurationMinutes }));
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await addLoan(
        {
          bookId: selectedBook.id,
          bookTitle: selectedBook.title,
          userId: currentUser.id,
          userName: currentUser.name,
          loanDate: new Date().toISOString().split("T")[0],
          dueDate: "",
          status: "active",
        },
        loanDurationMinutes
      );
      toast.success("Libro reservado correctamente");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo reservar el libro");
    }
  };

  const handleQueueReservation = async () => {
    if (!currentUser) {
      requireAuth("unirte a la cola de reservas");
      return;
    }

    const validationError = firstError(validateLoan({ bookId: selectedBook.id, durationMinutes: loanDurationMinutes }));
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await createReservation(selectedBook.id, loanDurationMinutes);
      toast.success("Te agregamos a la cola de reservas");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo crear la reserva en cola");
    }
  };

  const handleReturn = async () => {
    if (!activeLoan) {
      return;
    }

    try {
      await updateLoan(activeLoan.id, {
        status: "returned",
        returnDate: new Date().toISOString().split("T")[0],
      });
      toast.success("Libro devuelto correctamente");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo devolver el libro");
    }
  };

  const handleReadPdf = () => {
    if (!currentUser) {
      requireAuth("leer este libro");
      return;
    }

    if (!activeLoan && !selectedBook.isReservedByMe && currentUser.role !== "admin" && currentUser.role !== "librarian") {
      toast.error("Necesitas un prestamo activo para leer este libro");
      return;
    }

    setCurrentView("book-reader");
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <BackToCatalogButton onBack={() => setCurrentView("catalog")} />
          <BookDetailSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        <BackToCatalogButton onBack={() => setCurrentView("catalog")} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <BookActionPanel
              book={selectedBook}
              activeLoan={activeLoan}
              waitingReservation={waitingReservation}
              isFavorite={favorites.includes(selectedBook.id)}
              userRole={currentUser?.role}
              loanDurationMinutes={loanDurationMinutes}
              onLoanDurationChange={setLoanDurationMinutes}
              onFavoriteToggle={handleFavoriteToggle}
              onReturn={handleReturn}
              onReserve={handleReserve}
              onQueueReservation={handleQueueReservation}
              onReadPdf={handleReadPdf}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <BookOverview book={selectedBook} reviewCount={bookReviews.length} />
            <ReviewSection
              reviews={bookReviews}
              currentUser={currentUser}
              userReview={userReview}
              rating={rating}
              comment={comment}
              onRatingChange={setRating}
              onCommentChange={setComment}
              onSubmitReview={handleSubmitReview}
              onRequestLogin={() => setCurrentView("login")}
              onRequestDeleteReview={() => setConfirmDeleteOpen(true)}
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Eliminar resena?"
        description="Esta accion no se puede deshacer. Tu resena sera eliminada permanentemente."
        confirmLabel="Eliminar"
        destructive
        onConfirm={confirmDeleteReview}
      />

      <AuthRequiredDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} action={authAction} />
    </div>
  );
}

function BackToCatalogButton({ onBack }: { onBack: () => void }) {
  return (
    <Button variant="ghost" onClick={onBack}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      Volver al catalogo
    </Button>
  );
}
