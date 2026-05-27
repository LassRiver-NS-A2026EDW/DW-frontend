import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { StatusBadge } from "./StatusBadge";
import { formatLoanDuration } from "./LoanDurationSelect";
import type { Reservation } from "../mocks/mockData";

interface ReservationCardProps {
  reservation: Reservation;
  onCancel: (reservationId: string) => void;
}

export function ReservationCard({ reservation, onCancel }: ReservationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-3">
          <span>{reservation.bookTitle}</span>
          <StatusBadge status={reservation.status} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">Creada: {reservation.createdAt}</p>
        <p className="text-sm text-muted-foreground">
          Duracion solicitada: {formatLoanDuration(reservation.requestedLoanDurationMinutes)}
        </p>
        {reservation.status === "waiting" && (
          <p className="text-sm text-muted-foreground">Posicion en cola: #{reservation.queuePosition ?? "-"}</p>
        )}
        {reservation.fulfilledAt && <p className="text-sm text-muted-foreground">Asignada: {reservation.fulfilledAt}</p>}
        {reservation.cancelledAt && <p className="text-sm text-muted-foreground">Cancelada: {reservation.cancelledAt}</p>}
        {reservation.status === "waiting" && (
          <Button variant="outline" size="sm" onClick={() => onCancel(reservation.id)}>
            Cancelar reserva
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
