import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { StatusBadge } from "./StatusBadge";
import type { Loan } from "../mocks/mockData";

interface LoanCardProps {
  loan: Loan;
  onReturn: (loanId: string) => void;
  onRenew: (loanId: string) => void;
}

export function LoanCard({ loan, onReturn, onRenew }: LoanCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-3">
          <span>{loan.bookTitle}</span>
          <StatusBadge status={loan.status} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">Prestado: {loan.loanDate}</p>
        <p className="text-sm text-muted-foreground">Vence: {loan.dueDate}</p>
        {loan.copyCode && <p className="text-sm text-muted-foreground">Ejemplar: {loan.copyCode}</p>}
        <p className="text-sm text-muted-foreground">Renovaciones: {loan.renewalCount ?? 0}/2</p>
        {loan.returnDate && <p className="text-sm text-muted-foreground">Devuelto: {loan.returnDate}</p>}
        {loan.blockedReason && loan.status !== "returned" && (
          <p className="text-xs text-muted-foreground">{loan.blockedReason}</p>
        )}
        {loan.status !== "returned" && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => onRenew(loan.id)} disabled={!loan.canRenew}>
              Renovar
            </Button>
            <Button variant="outline" size="sm" onClick={() => onReturn(loan.id)}>
              Marcar como devuelto
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
