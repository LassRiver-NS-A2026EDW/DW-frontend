import { Badge } from "./ui/badge";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: "active" | "overdue" | "returned" | "available" | "unavailable" | "waiting" | "fulfilled" | "cancelled";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    active: {
      label: "Activo",
      icon: Clock,
      variant: "default" as const,
    },
    overdue: {
      label: "Vencido",
      icon: AlertCircle,
      variant: "destructive" as const,
    },
    returned: {
      label: "Devuelto",
      icon: CheckCircle,
      variant: "outline" as const,
    },
    available: {
      label: "Disponible",
      icon: CheckCircle,
      variant: "outline" as const,
    },
    unavailable: {
      label: "No disponible",
      icon: XCircle,
      variant: "destructive" as const,
    },
    waiting: {
      label: "En cola",
      icon: Clock,
      variant: "outline" as const,
    },
    fulfilled: {
      label: "Asignada",
      icon: CheckCircle,
      variant: "default" as const,
    },
    cancelled: {
      label: "Cancelada",
      icon: XCircle,
      variant: "secondary" as const,
    },
  };

  const { label, icon: Icon, variant } = config[status];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
