import { Fragment, FormEvent, useEffect, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
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
  Pencil,
  Loader2,
  List,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import { ReviewComment } from "../components/reviews/ReviewComment";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Book } from "../mocks/mockData";
import { booksApi, type BookCopyResponse } from "../api/books";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const blankBookForm: Omit<Book, "id"> = {
  title: "",
  author: "",
  isbn: "",
  category: "",
  language: "Español",
  publisher: "",
  publishDate: "",
  pages: 1,
  description: "",
  coverUrl: "",
  rating: 0,
  available: true,
  reviewCount: 0,
};

export function Admin() {
  const {
    currentUser,
    books,
    loans,
    reviews,
    addBook,
    updateBook,
    deleteBook,
    uploadBookPdf,
    downloadBookPdf,
    createBookCopy,
    deleteBookCopy,
    updateLoan,
    hideReview,
    keepReviewVisible,
    refreshLoans,
    refreshAdminReviews,
    setCurrentView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"dashboard" | "books" | "loans" | "reviews">("dashboard");
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [bookForm, setBookForm] = useState<Omit<Book, "id">>(blankBookForm);
  const [savingBook, setSavingBook] = useState(false);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [pdfSourceUrl, setPdfSourceUrl] = useState("");
  const [expandedCopiesBookId, setExpandedCopiesBookId] = useState<string | null>(null);
  const [bookCopies, setBookCopies] = useState<Record<string, BookCopyResponse[]>>({});
  const [copiesLoadingBookId, setCopiesLoadingBookId] = useState<string | null>(null);
  const [retiringCopyId, setRetiringCopyId] = useState<number | null>(null);
  const [bookPendingDelete, setBookPendingDelete] = useState<Book | null>(null);
  const [deletingBookId, setDeletingBookId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.role !== "admin" && currentUser?.role !== "librarian") return;
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

  const adminReviews = reviews.filter((review) => isPersistedReviewId(review.id));
  const hiddenReviews = adminReviews.filter((review) => review.flagged);

  const stats = {
    totalBooks: books.length,
    activeLoans: loans.filter((l) => l.status === "active").length,
    overdueLoans: loans.filter((l) => l.status === "overdue").length,
    flaggedReviews: hiddenReviews.length,
  };

  const activeLoans = loans.filter((l) => l.status === "active");
  const overdueLoans = loans.filter((l) => l.status === "overdue");
  const returnedLoans = loans.filter((l) => l.status === "returned");
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#cbd5e1",
          boxWidth: 12,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(148, 163, 184, 0.12)" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#94a3b8", precision: 0 },
        grid: { color: "rgba(148, 163, 184, 0.12)" },
      },
    },
  };
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#cbd5e1",
          boxWidth: 12,
        },
      },
    },
  };
  const loanStatusChart = {
    labels: ["Activos", "Vencidos", "Devueltos"],
    datasets: [
      {
        data: [activeLoans.length, overdueLoans.length, returnedLoans.length],
        backgroundColor: ["#22c55e", "#f59e0b", "#38bdf8"],
        borderColor: "rgba(15, 23, 42, 0.9)",
        borderWidth: 2,
      },
    ],
  };
  const inventoryChart = {
    labels: ["Disponibles", "En prestamo", "En cola"],
    datasets: [
      {
        label: "Ejemplares y solicitudes",
        data: [
          books.reduce((total, book) => total + (book.availableCopies ?? 0), 0),
          loans.filter((loan) => loan.status === "active" || loan.status === "overdue").length,
          books.reduce((total, book) => total + (book.waitingReservations ?? 0), 0),
        ],
        backgroundColor: ["#14b8a6", "#6366f1", "#f59e0b"],
        borderRadius: 8,
      },
    ],
  };
  const categoryRows = Object.entries(
    books.reduce<Record<string, number>>((acc, book) => {
      const category = book.category || "General";
      acc[category] = (acc[category] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((first, second) => second[1] - first[1])
    .slice(0, 6);
  const categoryChart = {
    labels: categoryRows.map(([category]) => category),
    datasets: [
      {
        label: "Libros",
        data: categoryRows.map(([, count]) => count),
        backgroundColor: "#0ea5e9",
        borderRadius: 8,
      },
    ],
  };

  const openAddBook = () => {
    setEditingBook(null);
    setBookForm(blankBookForm);
    setSelectedPdfFile(null);
    setPdfSourceUrl("");
    setShowAddBook(true);
  };

  const openEditBook = (book: Book) => {
    setEditingBook(book);
    setBookForm({ ...book });
    setSelectedPdfFile(null);
    setPdfSourceUrl("");
    setShowAddBook(true);
  };

  const closeBookForm = () => {
    setEditingBook(null);
    setShowAddBook(false);
    setBookForm(blankBookForm);
    setSelectedPdfFile(null);
    setPdfSourceUrl("");
  };

  const updateBookForm = (field: keyof Omit<Book, "id">, value: string | number | boolean) => {
    setBookForm((current) => ({ ...current, [field]: value }));
  };

  const submitBookForm = async (e: FormEvent) => {
    e.preventDefault();
    setSavingBook(true);
    try {
      if (editingBook) {
        await updateBook(editingBook.id, bookForm);
        if (selectedPdfFile) {
          await uploadBookPdf(editingBook.id, selectedPdfFile);
        } else if (pdfSourceUrl.trim()) {
          await downloadBookPdf(editingBook.id, pdfSourceUrl.trim());
        }
        toast.success("Libro actualizado correctamente");
      } else {
        const created = await addBook(bookForm);
        if (selectedPdfFile) {
          await uploadBookPdf(created.id, selectedPdfFile);
        } else if (pdfSourceUrl.trim()) {
          await downloadBookPdf(created.id, pdfSourceUrl.trim());
        }
        toast.success("Libro creado correctamente");
      }
      closeBookForm();
    } catch (err: any) {
      toast.error(err?.message || "No se pudo guardar el libro");
    } finally {
      setSavingBook(false);
    }
  };

  const loadCopies = async (bookId: string) => {
    setCopiesLoadingBookId(bookId);
    try {
      const copies = await booksApi.copies(bookId);
      setBookCopies((current) => ({ ...current, [bookId]: copies }));
    } catch (err: any) {
      toast.error(err?.message || "No se pudieron cargar los ejemplares");
    } finally {
      setCopiesLoadingBookId(null);
    }
  };

  const toggleCopies = async (book: Book) => {
    if (expandedCopiesBookId === book.id) {
      setExpandedCopiesBookId(null);
      return;
    }
    setExpandedCopiesBookId(book.id);
    await loadCopies(book.id);
  };

  const retireCopy = async (book: Book, copy: BookCopyResponse) => {
    setRetiringCopyId(copy.id);
    try {
      await deleteBookCopy(book.id, String(copy.id));
      toast.success("Ejemplar retirado");
      await loadCopies(book.id);
    } catch (err: any) {
      toast.error(err?.message || "No se pudo retirar el ejemplar");
    } finally {
      setRetiringCopyId(null);
    }
  };

  const confirmDeleteBook = async () => {
    if (!bookPendingDelete) return;
    const book = bookPendingDelete;
    setDeletingBookId(book.id);
    try {
      await deleteBook(book.id);
      toast.success("Libro y ejemplares eliminados");
      if (expandedCopiesBookId === book.id) {
        setExpandedCopiesBookId(null);
      }
      setBookCopies((current) => {
        const next = { ...current };
        delete next[book.id];
        return next;
      });
      setBookPendingDelete(null);
    } catch (err: any) {
      toast.error(err?.message || "No se pudo eliminar el libro");
    } finally {
      setDeletingBookId(null);
    }
  };

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
                    <p className="text-sm text-muted-foreground">Reseñas Ocultas</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estado de prestamos</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <Doughnut data={loanStatusChart} options={doughnutOptions} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Inventario operativo</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <Bar data={inventoryChart} options={chartOptions} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Libros por categoria</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <Bar data={categoryChart} options={chartOptions} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "books" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Gestión de Libros</h2>
              <Button onClick={openAddBook}>
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
                    <TableHead>Ejemplares</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <Fragment key={book.id}>
                      <TableRow>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>{book.category}</TableCell>
                        <TableCell>{book.isbn}</TableCell>
                        <TableCell>
                          <span className="font-medium">{book.availableCopies ?? 0}</span>
                          <span className="text-muted-foreground">/{book.totalCopies ?? 0}</span>
                          {(book.waitingReservations ?? 0) > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              Cola {book.waitingReservations}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={(book.active ?? book.available) ? "available" : "unavailable"} />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditBook(book)}
                              aria-label="Editar libro"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                try {
                                  await updateBook(book.id, { available: !(book.active ?? book.available) });
                                  toast.success("Estado actualizado");
                                } catch (err: any) {
                                  toast.error(err?.message || "No se pudo actualizar el estado");
                                }
                              }}
                              aria-label="Cambiar estado del libro"
                            >
                              {(book.active ?? book.available) ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                try {
                                  await createBookCopy(book.id);
                                  toast.success("Ejemplar agregado");
                                  if (expandedCopiesBookId === book.id) {
                                    await loadCopies(book.id);
                                  }
                                } catch (err: any) {
                                  toast.error(err?.message || "No se pudo agregar el ejemplar");
                                }
                              }}
                              aria-label="Agregar ejemplar"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleCopies(book)}
                              aria-label="Ver ejemplares"
                            >
                              <List className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setBookPendingDelete(book)}
                              disabled={deletingBookId === book.id}
                              aria-label="Eliminar libro y ejemplares"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              {deletingBookId === book.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedCopiesBookId === book.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/20 p-4">
                            <BookCopiesPanel
                              book={book}
                              copies={bookCopies[book.id] ?? []}
                              loading={copiesLoadingBookId === book.id}
                              retiringCopyId={retiringCopyId}
                              onRetire={retireCopy}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
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
                <CardTitle>Reseñas Registradas ({adminReviews.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {adminReviews.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay reseñas registradas para revisar
                  </p>
                ) : (
                  <div className="space-y-4">
                    {adminReviews.map((review) => (
                      <div
                        key={review.id}
                        className={`p-4 rounded-lg border ${
                          review.flagged
                            ? "bg-destructive/10 border-destructive/20"
                            : "bg-card border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0">
                            <p className="font-medium">{review.userName}</p>
                            <p className="text-sm text-muted-foreground">
                              Rating: {review.rating}/5 • {review.date}
                            </p>
                            <Badge variant={review.flagged ? "destructive" : "secondary"} className="mt-2">
                              {review.flagged ? "Oculta" : "Visible"}
                            </Badge>
                          </div>
                        </div>
                        <div className="my-3 text-sm">
                          <ReviewComment>{review.comment}</ReviewComment>
                        </div>
                        <div className="flex gap-2">
                          {review.flagged ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await keepReviewVisible(review.id);
                                  toast.success("Reseña visible nuevamente");
                                } catch (err: any) {
                                  toast.error(err?.message || "No se pudo mostrar la reseña");
                                }
                              }}
                            >
                              Mostrar Reseña
                            </Button>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await hideReview(review.id);
                                  toast.success("Reseña ocultada");
                                } catch (err: any) {
                                  toast.error(err?.message || "No se pudo ocultar la reseña");
                                }
                              }}
                            >
                              Ocultar Reseña
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {showAddBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-auto">
              <CardHeader>
                <CardTitle>{editingBook ? "Editar Libro" : "Agregar Libro"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={submitBookForm}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Titulo" value={bookForm.title} onChange={(e) => updateBookForm("title", e.target.value)} />
                    <Input placeholder="Autor" value={bookForm.author} onChange={(e) => updateBookForm("author", e.target.value)} />
                    <Input placeholder="ISBN" value={bookForm.isbn} onChange={(e) => updateBookForm("isbn", e.target.value)} />
                    <Input placeholder="Categoria" value={bookForm.category} onChange={(e) => updateBookForm("category", e.target.value)} />
                    <Input placeholder="Idioma" value={bookForm.language} onChange={(e) => updateBookForm("language", e.target.value)} />
                    <Input placeholder="Editorial" value={bookForm.publisher} onChange={(e) => updateBookForm("publisher", e.target.value)} />
                    <Input type="date" value={bookForm.publishDate} onChange={(e) => updateBookForm("publishDate", e.target.value)} />
                    <Input
                      type="number"
                      min={1}
                      placeholder="Paginas"
                      value={bookForm.pages || ""}
                      onChange={(e) => updateBookForm("pages", Number(e.target.value))}
                    />
                    <Input
                      className="md:col-span-2"
                      placeholder="URL de portada"
                      value={bookForm.coverUrl}
                      onChange={(e) => updateBookForm("coverUrl", e.target.value)}
                    />
                  </div>
                  <Textarea
                    placeholder="Descripcion"
                    value={bookForm.description}
                    onChange={(e) => updateBookForm("description", e.target.value)}
                    rows={4}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm">Archivo PDF</label>
                      <Input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(event) => setSelectedPdfFile(event.target.files?.[0] ?? null)}
                      />
                      <p className="text-xs text-muted-foreground">Tiene prioridad sobre la URL si ambos campos se completan.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">URL publica de PDF</label>
                      <Input
                        type="url"
                        placeholder="https://ejemplo.com/libro.pdf"
                        value={pdfSourceUrl}
                        onChange={(event) => setPdfSourceUrl(event.target.value)}
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={bookForm.available}
                      onChange={(e) => updateBookForm("available", e.target.checked)}
                    />
                    Disponible
                  </label>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={closeBookForm} disabled={savingBook}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={savingBook}>
                      {savingBook && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingBook ? "Guardar cambios" : "Crear libro"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(bookPendingDelete)}
        onOpenChange={(open) => {
          if (!open && !deletingBookId) setBookPendingDelete(null);
        }}
        title="¿Eliminar libro y ejemplares?"
        description={
          bookPendingDelete && (
            <div className="space-y-2 text-sm">
              <p>
                Se eliminará <strong>{bookPendingDelete.title}</strong> junto con todos sus ejemplares.
              </p>
              <p>
                También se limpiarán reseñas, favoritos, reservas históricas y préstamos ya devueltos asociados al libro.
              </p>
              <p className="text-muted-foreground">
                No se permitirá eliminar si existen préstamos activos, vencidos o usuarios en cola de reserva.
              </p>
            </div>
          )
        }
        confirmLabel={deletingBookId ? "Eliminando..." : "Eliminar libro"}
        destructive
        onConfirm={confirmDeleteBook}
      />
    </div>
  );
}

function isPersistedReviewId(reviewId: string) {
  return /^\d+$/.test(reviewId);
}

function BookCopiesPanel({
  book,
  copies,
  loading,
  retiringCopyId,
  onRetire,
}: {
  book: Book;
  copies: BookCopyResponse[];
  loading: boolean;
  retiringCopyId: number | null;
  onRetire: (book: Book, copy: BookCopyResponse) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando ejemplares...
      </div>
    );
  }

  if (copies.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay ejemplares registrados para este libro.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">Ejemplares de {book.title}</p>
          <p className="text-xs text-muted-foreground">
            Solo puedes retirar ejemplares disponibles, sin cola activa y conservando al menos uno.
          </p>
        </div>
        {(book.waitingReservations ?? 0) > 0 && (
          <Badge variant="secondary">Bloqueado por cola activa</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {copies.map((copy) => {
          const canRetire =
            copy.status === "AVAILABLE" &&
            (book.waitingReservations ?? 0) === 0 &&
            (book.totalCopies ?? 0) > 1;

          return (
            <div key={copy.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{copy.copyCode}</p>
                  <Badge variant={copy.status === "AVAILABLE" ? "secondary" : "outline"} className="mt-2">
                    {formatCopyStatus(copy.status)}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRetire(book, copy)}
                  disabled={!canRetire || retiringCopyId === copy.id}
                  aria-label="Retirar ejemplar"
                >
                  {retiringCopyId === copy.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {!canRetire && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {getCopyRetireBlockedReason(book, copy)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatCopyStatus(status: string) {
  const labels: Record<string, string> = {
    AVAILABLE: "Disponible",
    LOANED: "Prestado",
    RESERVED: "Reservado",
    INACTIVE: "Retirado",
  };
  return labels[status] ?? status;
}

function getCopyRetireBlockedReason(book: Book, copy: BookCopyResponse) {
  if (copy.status !== "AVAILABLE") return "Este ejemplar no esta disponible para retirar.";
  if ((book.waitingReservations ?? 0) > 0) return "Hay usuarios esperando este libro.";
  if ((book.totalCopies ?? 0) <= 1) return "No se puede retirar el ultimo ejemplar.";
  return "No disponible para retiro.";
}
