import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export type LoanDateField = "loanDate" | "dueDate" | "returnDate";

interface LoanDateFiltersProps {
  dateField: LoanDateField;
  startDate: string;
  endDate: string;
  resultCount: number;
  totalCount: number;
  onDateFieldChange: (value: LoanDateField) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClear: () => void;
}

export function LoanDateFilters({
  dateField,
  startDate,
  endDate,
  resultCount,
  totalCount,
  onDateFieldChange,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: LoanDateFiltersProps) {
  const hasFilters = Boolean(startDate || endDate);

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
      <div className="space-y-2">
        <label className="text-sm font-medium">Filtrar por</label>
        <Select value={dateField} onValueChange={(value) => onDateFieldChange(value as LoanDateField)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="loanDate">Fecha de prestamo</SelectItem>
            <SelectItem value="dueDate">Fecha de vencimiento</SelectItem>
            <SelectItem value="returnDate">Fecha de devolucion</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Desde</label>
        <Input type="date" value={startDate} onChange={(event) => onStartDateChange(event.target.value)} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Hasta</label>
        <Input type="date" value={endDate} onChange={(event) => onEndDateChange(event.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">
          {resultCount} de {totalCount}
        </p>
        <Button variant="outline" size="sm" onClick={onClear} disabled={!hasFilters}>
          Limpiar
        </Button>
      </div>
    </div>
  );
}
