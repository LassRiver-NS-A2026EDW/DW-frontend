import { Button } from "../ui/button";

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CatalogPagination({ page, totalPages, onPageChange }: CatalogPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      <p className="text-sm text-muted-foreground">
        Pagina {page + 1} de {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onPageChange(Math.max(0, page - 1))}>
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
