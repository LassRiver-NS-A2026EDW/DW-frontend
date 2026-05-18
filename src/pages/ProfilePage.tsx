import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { User, Mail, Shield, LogIn, Heart, MessageSquare, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { RoleBadge } from "../components/RoleBadge";
import { RatingStars } from "../components/RatingStars";
import { PasswordStrength, isPasswordStrong } from "../components/PasswordStrength";
import { firstError, validatePasswordChange, validateProfile } from "../utils/validation";

export function Profile() {
  const { currentUser, updateProfile, changePassword, reviews, books, favorites, setCurrentView, setSelectedBook } = useApp();
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <EmptyState
          icon={LogIn}
          title="Acceso Restringido"
          description="Debes iniciar sesión para ver tu perfil y gestionar tu cuenta"
          actionLabel="Iniciar Sesión"
          onAction={() => setCurrentView("login")}
        />
      </div>
    );
  }

  const userReviews = reviews.filter((r) => r.userId === currentUser.id);

  const goToReviewedBook = (bookId: string) => {
    const book = books.find((item) => item.id === bookId);
    if (!book) {
      toast.error("No se encontro el libro de esta resena");
      return;
    }
    setSelectedBook(book);
    setCurrentView("book-detail");
  };

  const handleSave = async () => {
    const validationError = firstError(validateProfile({ name, email }));
    if (validationError) {
      toast.error(validationError);
      return;
    }
    try {
      await updateProfile({ name, email });
      toast.success("Perfil actualizado correctamente");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo actualizar el perfil");
    }
  };

  const handlePasswordChange = async () => {
    const validationError = firstError(
      validatePasswordChange({
        currentPassword,
        newPassword,
        confirmPassword,
        passwordIsStrong: isPasswordStrong(newPassword),
      })
    );
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Contrasena actualizada correctamente");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo cambiar la contrasena");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Mi Perfil</h1>
          <p className="text-muted-foreground">Administra tu información personal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="p-8 text-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 shadow-lg">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-semibold text-xl mb-1">{currentUser.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{currentUser.email}</p>
              <RoleBadge role={currentUser.role} />
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-primary">{favorites.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Libros Favoritos</p>
                </div>
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-7 w-7 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-accent">{userReviews.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Reseñas Publicadas</p>
                </div>
                <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center">
                  <MessageSquare className="h-7 w-7 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombre Completo
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Correo Electrónico
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                El cambio de correo requiere reautenticacion y no esta disponible en esta fase.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Rol
              </label>
              <Input value={currentUser.role} disabled />
            </div>
            <Button onClick={handleSave}>Guardar Cambios</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cambiar Contrasena</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Contrasena actual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Nueva contrasena"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <PasswordStrength value={newPassword} />
            </div>
            <Input
              type="password"
              placeholder="Confirmar nueva contrasena"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button onClick={handlePasswordChange} disabled={changingPassword}>
              {changingPassword ? "Actualizando..." : "Actualizar Contrasena"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mis Reseñas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {userReviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No has escrito reseñas aún
              </p>
            ) : (
              <div className="space-y-3">
                {userReviews.slice(0, 5).map((review) => {
                  const reviewedBook = books.find((book) => book.id === review.bookId);

                  return (
                    <div key={review.id} className="p-4 bg-muted/30 rounded-xl border border-border">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {reviewedBook?.title ?? "Libro no disponible"}
                          </p>
                          <div className="flex items-center gap-3">
                            <RatingStars rating={review.rating} readonly size="sm" />
                            <p className="text-xs text-muted-foreground">{review.date}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!reviewedBook}
                          onClick={() => goToReviewedBook(review.bookId)}
                          className="shrink-0"
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Ir al libro
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
