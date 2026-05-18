import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  BookOpen,
  Users,
  TrendingUp,
  AlertCircle,
  Plus,
  CheckCircle,
  XCircle,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import { TableSkeleton } from "../components/LoadingSkeleton";

export function Admin() {
  const {
    currentUser,
    books,
    loans,
    reviews,
    addBook,
    updateBook,
    deleteBook,
    updateLoan,
    flagReview,
    unflagReview,
    refreshLoans,
    refreshAdminReviews,
    setCurrentView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"dashboard" | "books" | "loans" | "reviews">("dashboard");
  const [editingBook, setEditingBook] = useState<any>(null);
  const [showAddBook, setShowAddBook] = useState(false);

  useEffect(() => {
    if (currentUser?.role !== "admin") return;
    refreshLoans();
    if (activeTab === "reviews") {
      refreshAdminReviews();
    }
  }, [activeTab, currentUser?.role]);

  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "librarian")) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <EmptyState
          icon={AlertCircle}
          title="Acceso Denegado"
          description="No tienes permisos para acceder al panel de administración. Esta sección está reservada para administradores y bibliotecarios."
          actionLabel="Volver al Inicio"
          onAction={() => setCurrentView("home")}
        />
      </div>
    );
  }

  const stats = {
    totalBooks: books.length,
    activeLoans: loans.filter((l) => l.status === "active").length,
    overdueLoans: loans.filter((l) => l.status === "overdue").length,
    flaggedReviews: reviews.filter((r) => r.flagged).length,
  };

  const activeLoans = loans.filter((l) => l.status === "active");
  const overdueLoans = loans.filter((l) => l.status === "overdue");
  const flaggedReviews = reviews.filter((r) => r.flagged);

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona la biblioteca y sus recursos</p>
        </div>

        <div className="flex gap-2 border-b border-border">
          {["dashboard", "books", "loans", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "dashboard" && "Dashboard"}
              {tab === "books" && "Libros"}
              {tab === "loans" && "Préstamos"}
              {tab === "reviews" && "Reseñas"}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalBooks}</p>
                    <p className="text-sm text-muted-foreground">Libros Activos</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.activeLoans}</p>
                    <p className="text-sm text-muted-foreground">Préstamos Activos</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.overdueLoans}</p>
                    <p className="text-sm text-muted-foreground">Préstamos Vencidos</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.flaggedReviews}</p>
                    <p className="text-sm text-muted-foreground">Reseñas Marcadas</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "books" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Gestión de Libros</h2>
              <Button onClick={() => setShowAddBook(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Libro
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.category}</TableCell>
                      <TableCell>{book.isbn}</TableCell>
                      <TableCell>
                        <StatusBadge status={book.available ? "available" : "unavailable"} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              try {
                                await updateBook(book.id, { available: !book.available });
                                toast.success("Estado actualizado");
                              } catch (err: any) {
                                toast.error(err?.message || "No se pudo actualizar el estado");
                              }
                            }}
                          >
                            {book.available ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {activeTab === "loans" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Gestión de Préstamos</h2>

            <Card>
              <CardHeader>
                <CardTitle>Préstamos Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Libro</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Fecha Préstamo</TableHead>
                      <TableHead>Fecha Vencimiento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...activeLoans, ...overdueLoans].map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">{loan.bookTitle}</TableCell>
                        <TableCell>{loan.userName}</TableCell>
                        <TableCell>{loan.loanDate}</TableCell>
                        <TableCell>{loan.dueDate}</TableCell>
                        <TableCell>
                          <StatusBadge status={loan.status} />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                await updateLoan(loan.id, {
                                status: "returned",
                                returnDate: new Date().toISOString().split("T")[0],
                              });
                                toast.success("Prestamo marcado como devuelto");
                              } catch (err: any) {
                                toast.error(err?.message || "No se pudo marcar el prestamo como devuelto");
                              }
                            }}
                          >
                            Marcar Devuelto
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Moderación de Reseñas</h2>

            <Card>
              <CardHeader>
                <CardTitle>Reseñas Marcadas ({flaggedReviews.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {flaggedReviews.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay reseñas marcadas para revisar
                  </p>
                ) : (
                  <div className="space-y-4">
                    {flaggedReviews.map((review) => (
                      <div key={review.id} className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{review.userName}</p>
                            <p className="text-sm text-muted-foreground">
                              Rating: {review.rating}/5 • {review.date}
                            </p>
                            <Badge variant="destructive" className="mt-2">
                              {review.flagReason}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm my-3">{review.comment}</p>
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              unflagReview(review.id);
                              toast.success("Reseña ocultada");
                            }}
                          >
                            Ocultar Reseña
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              unflagReview(review.id);
                              toast.success("Reseña mantenida visible");
                            }}
                          >
                            Mantener Visible
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
