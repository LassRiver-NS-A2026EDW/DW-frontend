import { Badge } from "../ui/badge";
import { Shield, User, BookOpen } from "lucide-react";

interface RoleBadgeProps {
  role: "user" | "librarian" | "admin";
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = {
    user: {
      label: "Usuario",
      icon: User,
      variant: "secondary" as const,
    },
    librarian: {
      label: "Bibliotecario",
      icon: BookOpen,
      variant: "default" as const,
    },
    admin: {
      label: "Administrador",
      icon: Shield,
      variant: "default" as const,
    },
  };

  const { label, icon: Icon, variant } = config[role];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
