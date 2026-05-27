import { useEffect } from "react";
import { Clock, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { EmptyState } from "../components/EmptyState";
import { ReservationCard } from "../components/ReservationCard";

export function Reservations() {
  const { currentUser, reservations, refreshReservations, cancelReservation, setCurrentView } = useApp();

  useEffect(() => {
    if (currentUser) {
      refreshReservations();
    }
  }, [currentUser?.id]);

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <EmptyState
          icon={LogIn}
          title="Acceso restringido"
          description="Debes iniciar sesion para ver tus reservas en cola"
          actionLabel="Iniciar sesion"
          onAction={() => setCurrentView("login")}
        />
      </div>
    );
  }

  const handleCancel = async (reservationId: string) => {
    try {
      await cancelReservation(reservationId);
      toast.success("Reserva cancelada");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo cancelar la reserva");
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Reservas en cola</h1>
          <p className="text-muted-foreground">Consulta tus turnos cuando no hay ejemplares disponibles.</p>
        </div>

        {reservations.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No tienes reservas"
            description="Cuando un libro no tenga ejemplares disponibles podras unirte a su cola."
            actionLabel="Ir al catalogo"
            onAction={() => setCurrentView("catalog")}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
