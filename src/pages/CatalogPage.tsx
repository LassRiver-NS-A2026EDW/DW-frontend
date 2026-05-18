import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Heart, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { BookGridSkeleton } from "../components/LoadingSkeleton";
import { RatingStars } from "../components/RatingStars";
import { AuthRequiredDialog } from "../components/AuthRequiredDialog";
import * as Select from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export function Catalog() {
  const {
    books,
    favorites,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    languageFilter,
    setLanguageFilter,
    ratingFilter,
    setRatingFilter,
    availabilityFilter,
    setAvailabilityFilter,
    toggleFavorite,
    setSelectedBook,
    setCurrentView,
    currentUser,
  } = useApp();

  const [loading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || book.category === categoryFilter;
      const matchesLanguage = languageFilter === "all" || book.language === languageFilter;
      const matchesRating = ratingFilter === "all" || book.rating >= parseFloat(ratingFilter);
      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && book.available) ||
        (availabilityFilter === "unavailable" && !book.available);

      return matchesSearch && matchesCategory && matchesLanguage && matchesRating && matchesAvailability;
    });
  }, [books, searchQuery, categoryFilter, languageFilter, ratingFilter, availabilityFilter]);

  const categories = ["all", ...Array.from(new Set(books.map((b) => b.category)))];
  const languages = ["all", ...Array.from(new Set(books.map((b) => b.language)))];

  const handleFavoriteToggle = async (bookId: string) => {
    if (!currentUser) {
      setAuthDialogOpen(true);
      return;
    }
    const isFavorite = favorites.includes(bookId);
    try {
      await toggleFavorite(bookId);
      toast.success(isFavorite ? "Removido de favoritos" : "Agregado a favoritos");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo actualizar favoritos");
    }
  };

  const handleBookClick = (book: any) => {
    setSelectedBook(book);
    setCurrentView("book-detail");
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Explorar Biblioteca</h1>
          <p className="text-muted-foreground">
            Descubre nuestra colección de {books.length} libros disponibles
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Buscar por título o autor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0 transition-colors duration-200"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <Select.Root value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === "all" ? "Todas las categorías" : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select.Root>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Idioma</label>
              <Select.Root value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar idioma" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang === "all" ? "Todos los idiomas" : lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select.Root>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rating Mínimo</label>
              <Select.Root value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Cualquier rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier rating</SelectItem>
                  <SelectItem value="4">4+ estrellas</SelectItem>
                  <SelectItem value="4.5">4.5+ estrellas</SelectItem>
                  <SelectItem value="4.7">4.7+ estrellas</SelectItem>
                </SelectContent>
              </Select.Root>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Disponibilidad</label>
              <Select.Root value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="available">Disponibles</SelectItem>
                  <SelectItem value="unavailable">No disponibles</SelectItem>
                </SelectContent>
              </Select.Root>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredBooks.length} {filteredBooks.length === 1 ? "libro encontrado" : "libros encontrados"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCategoryFilter("all");
              setLanguageFilter("all");
              setRatingFilter("all");
              setAvailabilityFilter("all");
              setSearchQuery("");
            }}
          >
            Limpiar filtros
          </Button>
        </div>

        {loading ? (
          <BookGridSkeleton count={8} />
        ) : filteredBooks.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No se encontraron libros"
            description="Intenta ajustar los filtros o la búsqueda para encontrar lo que buscas"
            actionLabel="Limpiar Filtros"
            onAction={() => {
              setCategoryFilter("all");
              setLanguageFilter("all");
              setRatingFilter("all");
              setAvailabilityFilter("all");
              setSearchQuery("");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <Card
                key={book.id}
                className={`overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group ${
                  !book.available ? "opacity-80" : ""
                }`}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                      !book.available ? "grayscale opacity-60" : ""
                    }`}
                    onClick={() => handleBookClick(book)}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteToggle(book.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-full hover:scale-110 active:scale-95 transition-transform duration-200"
                    aria-label="Alternar favorito"
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors duration-200 ${
                        favorites.includes(book.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    />
                  </button>
                  {!book.available && (
                    <div className="absolute bottom-0 left-0 right-0 bg-destructive/90 text-destructive-foreground py-1 px-2 text-xs text-center font-medium tracking-wide">
                      No disponible
                    </div>
                  )}
                </div>
                <CardContent className="p-4" onClick={() => handleBookClick(book)}>
                  <h3 className="font-medium text-foreground line-clamp-2 mb-1">{book.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{book.author}</p>
                  <div className="mb-3">
                    <RatingStars rating={book.rating} readonly size="sm" showLabel />
                    <span className="text-xs text-muted-foreground ml-1">({book.reviewCount})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{book.category}</Badge>
                    <Badge variant="outline">{book.language}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AuthRequiredDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        action="agregar libros a favoritos"
      />
    </div>
  );
}
