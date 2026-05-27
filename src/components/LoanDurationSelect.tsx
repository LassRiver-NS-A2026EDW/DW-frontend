import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface LoanDurationSelectProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

const DURATION_OPTIONS = [
  { value: 5, label: "5 minutos" },
  { value: 60, label: "1 hora" },
  { value: 1440, label: "1 dia" },
  { value: 4320, label: "3 dias" },
  { value: 10080, label: "7 dias" },
];

export function LoanDurationSelect({ value, onChange, label = "Duracion del prestamo" }: LoanDurationSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Select value={String(value)} onValueChange={(nextValue) => onChange(Number(nextValue))}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DURATION_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function formatLoanDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} h`;
  return `${Math.round(minutes / 1440)} dias`;
}
