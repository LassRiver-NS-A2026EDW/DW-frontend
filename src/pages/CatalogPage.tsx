import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { BookGridSkeleton } from "../components/LoadingSkeleton";
import { AuthRequiredDialog } from "../components/AuthRequiredDialog";
import { BookFilters } from "../components/BookFilters";
import { BookCard } from "../components/catalog/BookCard";
import { CatalogPagination } from "../components/catalog/CatalogPagination";
import type { Book } from "../mocks/mockData";

export function Catalog() {
  const {
    books,
    bookCategories,
    bookLanguages,
    booksLoading,
    bookPage,
    bookTotalElements,
    bookTotalPages,
    setBookPage,
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

  const [showFilters, setShowFilters] = useState(true);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesRating = ratingFilter === "all" || book.rating >= parseFloat(ratingFilter);
      return matchesRating;
    });
  }, [books, ratingFilter]);

  const categories = bookCategories;
  const languages = bookLanguages;

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

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setCurrentView("book-detail");
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Explorar Biblioteca</h1>
          <p className="text-muted-foreground">
            Descubre nuestra coleccion de {bookTotalElements} libros disponibles
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
          <BookFilters
            categories={categories}
            languages={languages}
            categoryFilter={categoryFilter}
            languageFilter={languageFilter}
            ratingFilter={ratingFilter}
            availabilityFilter={availabilityFilter}
            onCategoryChange={setCategoryFilter}
            onLanguageChange={setLanguageFilter}
            onRatingChange={setRatingFilter}
            onAvailabilityChange={setAvailabilityFilter}
          />
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {bookTotalElements} {bookTotalElements === 1 ? "libro encontrado" : "libros encontrados"}
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

        {booksLoading ? (
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
              <BookCard
                key={book.id}
                book={book}
                isFavorite={favorites.includes(book.id)}
                onOpen={handleBookClick}
                onToggleFavorite={handleFavoriteToggle}
              />
            ))}
          </div>
        )}

        {!booksLoading && <CatalogPagination page={bookPage} totalPages={bookTotalPages} onPageChange={setBookPage} />}
      </div>

      <AuthRequiredDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        action="agregar libros a favoritos"
      />
    </div>
  );
}
