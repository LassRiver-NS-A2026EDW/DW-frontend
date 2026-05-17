import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { toast } from "sonner";

export function Register() {
  const { register, setCurrentView } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Por favor complete todos los campos");
      return;
    }
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (register(name, email, password)) {
      toast.success("Cuenta creada correctamente");
      setCurrentView("catalog");
    } else {
      toast.error("El correo electrónico ya está registrado");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Patrón de fondo inspirado en el logo */}
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

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <img src="figma:asset/imagen.png" alt="LassRiver NS" className="h-20 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-foreground mb-2">LassRiver NS</h1>
          <p className="text-muted-foreground">Biblioteca Digital Premium</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>Regístrate para acceder a la biblioteca</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nombre Completo
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Correo Electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full">
                Crear Cuenta
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setCurrentView("login")}
                  className="text-primary hover:underline"
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
