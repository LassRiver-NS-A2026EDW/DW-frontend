import { useState, useMemo } from "react";
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
import {
  Select as RxSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import {
  PasswordStrength,
  isPasswordStrong,
} from "../components/PasswordStrength";
import { Gender } from "../api/auth";
import logo from "../assets/logo.png";
import { firstError, maxBirthDateForMinimumAge, validateRegister } from "../utils/validation";

const GENDERS: { value: Gender; label: string }[] = [
  { value: "F", label: "Femenino" },
  { value: "M", label: "Masculino" },
  { value: "OTHER", label: "Otro" },
  { value: "NR", label: "Prefiero no decir" },
];

export function Register() {
  const { register, setCurrentView, authLoading, authError } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<Gender>("NR");
  const [birthDate, setBirthDate] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const strong = useMemo(() => isPasswordStrong(password), [password]);

  const maxBirthDate = maxBirthDateForMinimumAge();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !confirmPassword || !birthDate) {
      toast.error("Por favor complete todos los campos");
      return;
    }
    if (!strong) {
      toast.error("La contraseña no cumple los criterios de seguridad");
      return;
    }
    if (!passwordsMatch) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    const validationError = firstError(
      validateRegister({
        name,
        email,
        password,
        confirmPassword,
        gender,
        birthDate,
        passwordIsStrong: strong,
      })
    );
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setSubmitting(true);
    try {
      const ok = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        gender,
        birthDate,
      });
      if (ok) {
        toast.success("Cuenta creada correctamente");
        setCurrentView("catalog");
      }
    } catch (err: any) {
      toast.error(err?.message || "No se pudo crear la cuenta. Verifica los datos.");
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-surface to-secondary/10">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="wave-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M0 50 Q 25 25, 50 50 T 100 50" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-primary"/>
                <path d="M0 60 Q 25 35, 50 60 T 100 60" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-secondary"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wave-pattern)" />
          </svg>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10 py-8">
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="LassRiver NS"
            className="h-24 mx-auto mb-6 drop-shadow-xl transition-transform duration-500 hover:scale-105"
          />
          <h1 className="text-4xl font-bold text-foreground mb-2">LassRiver NS</h1>
          <p className="text-muted-foreground">Biblioteca Digital Premium</p>
        </div>

        <Card className="transition-all duration-300 hover:shadow-xl">
          <CardHeader>
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>Regístrate para acceder a la biblioteca</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {authError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {authError}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nombre Completo
                </label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={busy}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Correo Electrónico
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="birthDate" className="text-sm font-medium">
                    Fecha de Nacimiento
                  </label>
                  <Input
                    id="birthDate"
                    type="date"
                    max={maxBirthDate}
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    disabled={busy}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Género</label>
                  <RxSelect value={gender} onValueChange={(v) => setGender(v as Gender)}>
                    <SelectTrigger disabled={busy}>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </RxSelect>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={busy}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground transition-colors duration-200"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <PasswordStrength value={password} />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={busy}
                    className={`pr-10 transition-colors duration-200 ${
                      passwordsMismatch
                        ? "border-destructive focus-visible:ring-destructive/40"
                        : passwordsMatch
                          ? "border-green-500/60 focus-visible:ring-green-500/30"
                          : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground transition-colors duration-200"
                    aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <p
                    className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                      passwordsMatch ? "text-green-500" : "text-destructive"
                    }`}
                  >
                    {passwordsMatch ? (
                      <>
                        <Check className="h-3 w-3" /> Las contraseñas coinciden
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3" /> Las contraseñas no coinciden
                      </>
                    )}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full transition-transform duration-200 hover:scale-[1.01]"
                disabled={busy || !strong || !passwordsMatch}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setCurrentView("login")}
                  className="text-primary hover:underline transition-colors duration-200"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
