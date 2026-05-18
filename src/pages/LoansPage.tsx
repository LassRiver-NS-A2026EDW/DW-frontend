import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import { BookOpen, LogIn } from "lucide-react";
import { toast } from "sonner";

export function Loans() {
  const { currentUser, loans, refreshLoans, updateLoan, setCurrentView } = useApp();

  useEffect(() => {
    if (currentUser) {
      refreshLoans();
    }
  }, [currentUser?.id]);

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <EmptyState
          icon={LogIn}
          title="Acceso Restringido"
          description="Debes iniciar sesión para ver tus préstamos"
          actionLabel="Iniciar Sesión"
          onAction={() => setCurrentView("login")}
        />
      </div>
    );
  }

  const handleReturn = async (loanId: string) => {
    try {
      await updateLoan(loanId, { status: "returned" });
      toast.success("Préstamo devuelto correctamente");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo devolver el préstamo");
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Mis Préstamos</h1>
          <p className="text-muted-foreground">Consulta y gestiona tus libros prestados.</p>
        </div>

        {loans.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No tienes préstamos"
            description="Reserva un libro desde el catálogo para verlo en esta sección."
            actionLabel="Ir al Catálogo"
            onAction={() => setCurrentView("catalog")}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {loans.map((loan) => (
              <Card key={loan.id}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-3">
                    <span>{loan.bookTitle}</span>
                    <StatusBadge status={loan.status} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">Prestado: {loan.loanDate}</p>
                  <p className="text-sm text-muted-foreground">Vence: {loan.dueDate}</p>
                  {loan.returnDate && (
                    <p className="text-sm text-muted-foreground">Devuelto: {loan.returnDate}</p>
                  )}
                  {loan.status !== "returned" && (
                    <Button variant="outline" size="sm" onClick={() => handleReturn(loan.id)}>
                      Marcar como devuelto
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
