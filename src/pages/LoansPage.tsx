import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { EmptyState } from "../components/EmptyState";
import { LoanCard } from "../components/LoanCard";
import { LoanDurationSelect } from "../components/LoanDurationSelect";
import { LoanDateFilters, type LoanDateField } from "../components/loans/LoanDateFilters";
import { BookOpen, LogIn } from "lucide-react";
import { toast } from "sonner";
import type { LoanRenewalResponse } from "../api/loans";
import type { Loan } from "../mocks/mockData";

export function Loans() {
  const { currentUser, loans, refreshLoans, updateLoan, renewLoan, getLoanHistory, setCurrentView } = useApp();
  const [renewLoanId, setRenewLoanId] = useState<string | null>(null);
  const [renewDurationMinutes, setRenewDurationMinutes] = useState(1440);
  const [historyByLoan, setHistoryByLoan] = useState<Record<string, LoanRenewalResponse[]>>({});
  const [dateField, setDateField] = useState<LoanDateField>("loanDate");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (currentUser) {
      refreshLoans();
    }
  }, [currentUser?.id]);

  const filteredLoans = useMemo(
    () => loans.filter((loan) => matchesLoanDateRange(loan, dateField, startDate, endDate)),
    [dateField, endDate, loans, startDate]
  );

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
  };

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

  const openRenewDialog = async (loanId: string) => {
    setRenewLoanId(loanId);
    try {
      const history = await getLoanHistory(loanId);
      setHistoryByLoan((current) => ({ ...current, [loanId]: history }));
    } catch {
      setHistoryByLoan((current) => ({ ...current, [loanId]: [] }));
    }
  };

  const handleRenew = async () => {
    if (!renewLoanId) return;
    try {
      await renewLoan(renewLoanId, renewDurationMinutes);
      const history = await getLoanHistory(renewLoanId);
      setHistoryByLoan((current) => ({ ...current, [renewLoanId]: history }));
      toast.success("Prestamo renovado correctamente");
      setRenewLoanId(null);
    } catch (err: any) {
      toast.error(err?.message || "No se pudo renovar el prestamo");
    }
  };

  const selectedLoan = renewLoanId ? loans.find((loan) => loan.id === renewLoanId) : null;

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
          <>
            <LoanDateFilters
              dateField={dateField}
              startDate={startDate}
              endDate={endDate}
              resultCount={filteredLoans.length}
              totalCount={loans.length}
              onDateFieldChange={setDateField}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onClear={clearDateFilters}
            />

            {filteredLoans.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No hay prestamos en ese rango"
                description="Ajusta las fechas o limpia el filtro para volver a ver tus prestamos."
                actionLabel="Limpiar filtro"
                onAction={clearDateFilters}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredLoans.map((loan) => (
                  <LoanCard key={loan.id} loan={loan} onReturn={handleReturn} onRenew={openRenewDialog} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={Boolean(renewLoanId)} onOpenChange={(open) => !open && setRenewLoanId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renovar prestamo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedLoan && (
              <div className="rounded-md border border-border p-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{selectedLoan.bookTitle}</p>
                <p>Vencimiento actual: {selectedLoan.dueDate}</p>
                <p>Renovaciones usadas: {selectedLoan.renewalCount ?? 0}/2</p>
              </div>
            )}
            <LoanDurationSelect
              value={renewDurationMinutes}
              onChange={setRenewDurationMinutes}
              label="Duracion de la renovacion"
            />
            {renewLoanId && (historyByLoan[renewLoanId]?.length ?? 0) > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Historial</p>
                {historyByLoan[renewLoanId].map((renewal) => (
                  <div key={renewal.id} className="rounded-md bg-muted/30 p-2 text-xs text-muted-foreground">
                    {renewal.previousDueDate.replace("T", " ").slice(0, 16)} {"->"} {renewal.newDueDate.replace("T", " ").slice(0, 16)}
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRenewLoanId(null)}>
                Cancelar
              </Button>
              <Button onClick={handleRenew}>Renovar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function matchesLoanDateRange(loan: Loan, field: LoanDateField, startDate: string, endDate: string) {
  if (!startDate && !endDate) {
    return true;
  }

  const targetDate = getLoanDateValue(loan, field);
  if (!targetDate) {
    return false;
  }

  if (startDate && targetDate < startDate) {
    return false;
  }

  if (endDate && targetDate > endDate) {
    return false;
  }

  return true;
}

function getLoanDateValue(loan: Loan, field: LoanDateField) {
  return loan[field]?.slice(0, 10) ?? "";
}
