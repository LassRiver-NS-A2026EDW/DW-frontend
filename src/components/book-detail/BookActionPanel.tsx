import { CheckCircle, Clock, FileText, Heart, Library, type LucideIcon } from "lucide-react";
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
  const cooldownUntil = getActiveCooldownUntil(book.loanCooldownUntil);

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

        <InventorySummary book={book} />

        {!activeLoan && !book.isReservedByMe && cooldownUntil && <CooldownNotice cooldownUntil={cooldownUntil} />}

        <LoanActionButton
          book={book}
          activeLoan={activeLoan}
          waitingReservation={waitingReservation}
          cooldownUntil={cooldownUntil}
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

function InventorySummary({ book }: { book: Book }) {
  const total = book.totalCopies ?? 0;
  const available = book.availableCopies ?? 0;
  const queue = book.waitingReservations ?? 0;
  const availablePercent = total > 0 ? Math.min(100, Math.round((available / total) * 100)) : 0;
  const statusLabel =
    available > 0 ? `${available} ${available === 1 ? "ejemplar libre" : "ejemplares libres"}` : "Sin ejemplares libres";

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Inventario</p>
          <p className="mt-1 font-semibold text-foreground">{statusLabel}</p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            available > 0
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border border-amber-500/30 bg-amber-500/10 text-amber-300"
          }`}
        >
          {queue > 0 ? "Cola activa" : available > 0 ? "Disponible" : "Agotado"}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-background">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${availablePercent}%` }} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <InventoryStat icon={Library} label="Total" value={total} />
        <InventoryStat icon={CheckCircle} label="Libres" value={available} />
        <InventoryStat icon={Clock} label="Cola" value={queue} />
      </div>
    </div>
  );
}

function InventoryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-0 rounded-md bg-background/60 px-2 py-2">
      <div className="flex items-center justify-center gap-1 text-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="font-semibold">{value}</span>
      </div>
      <p className="mt-0.5 truncate text-center text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function LoanActionButton({
  book,
  activeLoan,
  waitingReservation,
  cooldownUntil,
  onReturn,
  onReserve,
  onQueueReservation,
}: Pick<BookActionPanelProps, "book" | "activeLoan" | "waitingReservation" | "onReturn" | "onReserve" | "onQueueReservation"> & {
  cooldownUntil: Date | null;
}) {
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

  if (cooldownUntil) {
    return (
      <Button className="w-full" variant="outline" disabled>
        Disponible en {formatCooldownRemaining(cooldownUntil)}
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

function CooldownNotice({ cooldownUntil }: { cooldownUntil: Date }) {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
      <p className="font-medium">Cooldown de prestamo activo</p>
      <p className="mt-1 text-amber-100/80">
        Podras reservar este libro otra vez en {formatCooldownRemaining(cooldownUntil)}.
      </p>
    </div>
  );
}

function getActiveCooldownUntil(value?: string | null) {
  if (!value) return null;
  const cooldownUntil = new Date(value);
  if (Number.isNaN(cooldownUntil.getTime()) || cooldownUntil.getTime() <= Date.now()) {
    return null;
  }
  return cooldownUntil;
}

function formatCooldownRemaining(cooldownUntil: Date) {
  const remainingMs = Math.max(0, cooldownUntil.getTime() - Date.now());
  const totalMinutes = Math.ceil(remainingMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 24) {
    return "1 dia";
  }
  if (hours > 0 && minutes > 0) {
    return `${hours} h ${minutes} min`;
  }
  if (hours > 0) {
    return `${hours} h`;
  }
  return `${Math.max(1, minutes)} min`;
}
