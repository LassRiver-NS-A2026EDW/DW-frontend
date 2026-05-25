import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Loader2, LogIn, Shield, Sparkles, UserPlus } from "lucide-react";
import logo from "../assets/logo.png";
import { firstError, validateLogin } from "../utils/validation";

export function Login() {
  const { login, setCurrentView, authLoading, authError } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = firstError(validateLogin({ email, password }));
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setSubmitting(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        toast.success("Sesion iniciada correctamente");
        setCurrentView("catalog");
      }
    } catch (err: any) {
      toast.error(err?.message || "Credenciales incorrectas o el servidor no respondio");
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-primary/10">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <pattern id="wave-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                <path d="M0 60 Q 30 30, 60 60 T 120 60" stroke="currentColor" strokeWidth="0.7" fill="none" className="text-primary" />
                <path d="M0 80 Q 30 50, 60 80 T 120 80" stroke="currentColor" strokeWidth="0.7" fill="none" className="text-accent" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wave-pattern)" />
          </svg>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="LassRiver NS"
            className="h-24 mx-auto mb-6 drop-shadow-xl transition-transform duration-500 hover:scale-105"
          />
          <h1 className="text-4xl font-bold text-foreground mb-2">LassRiver NS</h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Biblioteca Digital Premium
          </p>
        </div>

        <Card className="overflow-hidden border-border/70 bg-card/95 backdrop-blur transition-all duration-300 hover:shadow-xl">
          <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <LogIn className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Iniciar Sesion</CardTitle>
                <CardDescription>Accede para continuar tu lectura</CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {authError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {authError}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Correo electronico
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Contrasena
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={busy}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground transition-colors duration-200"
                    aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full transition-transform duration-200 hover:scale-[1.01]" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesion
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setCurrentView("catalog")}>
                <Sparkles className="h-4 w-4 mr-2" />
                Continuar como invitado
              </Button>
              <div className="w-full rounded-lg border border-accent/20 bg-accent/5 p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-accent" />
                  <p className="text-xs font-bold uppercase tracking-wider text-accent">Usuarios de prueba</p>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Contrasena: <code className="text-foreground bg-muted px-1.5 py-0.5 rounded">LassRiver2026!</code>
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li><span className="text-foreground font-medium">daniel.lasso@lassriver.com</span> - Usuario</li>
                  <li><span className="text-foreground font-medium">ana.rivera@lassriver.com</span> - Bibliotecaria</li>
                  <li><span className="text-foreground font-medium">admin@lassriver.com</span> - Administrador</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setCurrentView("register")}
                  className="text-primary hover:underline transition-colors duration-200"
                >
                  Registrate aqui <UserPlus className="inline h-3.5 w-3.5 ml-1" />
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
