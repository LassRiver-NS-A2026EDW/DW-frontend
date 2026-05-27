import { FileText, Heart } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { LoanDurationSelect } from "../LoanDurationSelect";
import type { Book, Loan, Reservation, User } from "../../mocks/mockData";

interface BookActionPanelProps {
  book: Book;
  activeLoan?: Loan | null;
  waitingReservation?: Reservation | null;
  isFavorite: boolean;
  userRole?: User["role"];
  loanDurationMinutes: number;
  onLoanDurationChange: (value: number) => void;
  onFavoriteToggle: () => void;
  onReturn: () => void;
  onReserve: () => void;
  onQueueReservation: () => void;
  onReadPdf: () => void;
}

export function BookActionPanel({
  book,
  activeLoan,
  waitingReservation,
  isFavorite,
  userRole,
  loanDurationMinutes,
  onLoanDurationChange,
  onFavoriteToggle,
  onReturn,
  onReserve,
  onQueueReservation,
  onReadPdf,
}: BookActionPanelProps) {
  const isPrivileged = userRole === "admin" || userRole === "librarian";
  const canReadPdf = Boolean(activeLoan || book.isReservedByMe || isPrivileged);

  return (
    <Card className="overflow-hidden sticky top-6">
      <div className="aspect-[3/4] bg-muted">
        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
      </div>
      <CardContent className="p-4 space-y-3">
        <Button className="w-full" variant={isFavorite ? "secondary" : "default"} onClick={onFavoriteToggle}>
          <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
          {isFavorite ? "En Favoritos" : "Agregar a Favoritos"}
        </Button>

        <LoanDurationSelect value={loanDurationMinutes} onChange={onLoanDurationChange} />

        <div className="grid grid-cols-3 gap-2 rounded-md border border-border p-2 text-center text-xs">
          <InventoryStat label="Total" value={book.totalCopies ?? 0} />
          <InventoryStat label="Libres" value={book.availableCopies ?? 0} />
          <InventoryStat label="Cola" value={book.waitingReservations ?? 0} />
        </div>

        <LoanActionButton
          book={book}
          activeLoan={activeLoan}
          waitingReservation={waitingReservation}
          onReturn={onReturn}
          onReserve={onReserve}
          onQueueReservation={onQueueReservation}
        />

        {book.hasPdf ? (
          <Button className="w-full" variant="secondary" onClick={onReadPdf} disabled={!canReadPdf}>
            <FileText className="h-4 w-4 mr-2" />
            {canReadPdf ? "Leer PDF" : "Requiere prestamo activo"}
          </Button>
        ) : (
          <Button className="w-full" variant="outline" disabled>
            <FileText className="h-4 w-4 mr-2" />
            Sin PDF disponible
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function InventoryStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-semibold">{value}</p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}

function LoanActionButton({
  book,
  activeLoan,
  waitingReservation,
  onReturn,
  onReserve,
  onQueueReservation,
}: Pick<BookActionPanelProps, "book" | "activeLoan" | "waitingReservation" | "onReturn" | "onReserve" | "onQueueReservation">) {
  if (activeLoan || book.isReservedByMe) {
    return (
      <Button className="w-full" variant="destructive" onClick={onReturn} disabled={!activeLoan}>
        Devolver Libro
      </Button>
    );
  }

  if (waitingReservation) {
    return (
      <Button className="w-full" variant="outline" disabled>
        En cola #{waitingReservation.queuePosition ?? "-"}
      </Button>
    );
  }

  if (!book.available && (book.totalCopies ?? 0) > 0) {
    return (
      <Button className="w-full" variant="outline" onClick={onQueueReservation}>
        Unirme a la cola
      </Button>
    );
  }

  return (
    <Button className="w-full" variant="outline" disabled={!book.available} onClick={onReserve}>
      {book.available ? "Reservar Libro" : "No Disponible"}
    </Button>
  );
}
