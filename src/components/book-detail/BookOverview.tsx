import type { ComponentType } from "react";
import { BookOpen, Building2, Calendar, Globe } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { RatingStars } from "../RatingStars";
import { StatusBadge } from "../StatusBadge";
import type { Book } from "../../mocks/mockData";

interface BookOverviewProps {
  book: Book;
  reviewCount?: number;
}

export function BookOverview({ book, reviewCount }: BookOverviewProps) {
  const visibleReviewCount = reviewCount ?? book.reviewCount;

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">{book.title}</h1>
      <p className="text-xl text-muted-foreground mb-4">{book.author}</p>

      <div className="flex items-center gap-4 mb-6">
        <RatingStars rating={book.rating} readonly size="lg" showLabel />
        <span className="text-sm text-muted-foreground">
          ({visibleReviewCount} {visibleReviewCount === 1 ? "resena" : "resenas"})
        </span>
        <StatusBadge status={book.available ? "available" : "unavailable"} />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="default">{book.category}</Badge>
        <Badge variant="secondary">{book.language}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Libro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DetailRow icon={Building2} label="Editorial" value={book.publisher} />
          <DetailRow icon={Calendar} label="Fecha de Publicacion" value={formatPublishDate(book.publishDate)} />
          <DetailRow icon={BookOpen} label="Paginas" value={String(book.pages)} />
          <DetailRow icon={Globe} label="ISBN" value={book.isbn} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Descripcion</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{book.description}</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface DetailRowProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function DetailRow({ icon: Icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

function formatPublishDate(date: string) {
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
