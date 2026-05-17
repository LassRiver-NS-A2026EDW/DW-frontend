import { Check, X } from "lucide-react";

export interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: "Mínimo 8 caracteres", test: (v) => v.length >= 8 },
  { id: "upper", label: "Una letra mayúscula", test: (v) => /[A-Z]/.test(v) },
  { id: "number", label: "Un número", test: (v) => /\d/.test(v) },
  {
    id: "special",
    label: "Un carácter especial (!@#$…)",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

export function isPasswordStrong(value: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}

export function passwordStrengthScore(value: string): number {
  return PASSWORD_RULES.filter((rule) => rule.test(value)).length;
}

interface PasswordStrengthProps {
  value: string;
}

export function PasswordStrength({ value }: PasswordStrengthProps) {
  const score = passwordStrengthScore(value);
  const max = PASSWORD_RULES.length;
  const percent = (score / max) * 100;

  const barColor =
    score === 0
      ? "bg-muted"
      : score <= 1
        ? "bg-destructive"
        : score === 2
          ? "bg-yellow-500"
          : score === 3
            ? "bg-amber-400"
            : "bg-green-500";

  const label =
    value.length === 0
      ? "Ingresa una contraseña"
      : score <= 1
        ? "Débil"
        : score === 2
          ? "Aceptable"
          : score === 3
            ? "Buena"
            : "Fuerte";

  return (
    <div className="space-y-3 mt-2">
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Seguridad: <span className="font-medium text-foreground">{label}</span>
      </p>
      <ul className="space-y-1.5">
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(value);
          return (
            <li
              key={rule.id}
              className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                passed ? "text-green-500" : "text-muted-foreground"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full transition-colors duration-200 ${
                  passed
                    ? "bg-green-500/15 text-green-500"
                    : "bg-destructive/10 text-destructive/70"
                }`}
              >
                {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              </span>
              <span>{rule.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
