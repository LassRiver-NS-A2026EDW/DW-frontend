import { LogIn, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useApp } from "../context/AppContext";

interface AuthRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: string;
}

export function AuthRequiredDialog({
  open,
  onOpenChange,
  action,
}: AuthRequiredDialogProps) {
  const { setCurrentView } = useApp();

  const go = (view: string) => {
    onOpenChange(false);
    setCurrentView(view);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md transition-all duration-200">
        <DialogHeader>
          <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <LogIn className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-center">Inicia sesión para continuar</DialogTitle>
          <DialogDescription className="text-center">
            {action
              ? `Necesitas iniciar sesión para ${action}.`
              : "Esta acción requiere que hayas iniciado sesión."}
            <br />
            Únete a nuestra comunidad y disfruta de todas las funciones.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => go("register")}
            className="gap-2 transition-all duration-200 hover:scale-[1.02]"
          >
            <UserPlus className="h-4 w-4" />
            Registrarse
          </Button>
          <Button
            onClick={() => go("login")}
            className="gap-2 transition-all duration-200 hover:scale-[1.02]"
          >
            <LogIn className="h-4 w-4" />
            Iniciar Sesión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
