import { Heart } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { RatingStars } from "../RatingStars";
import type { Book } from "../../mocks/mockData";

interface BookCardProps {
  book: Book;
  isFavorite: boolean;
  onOpen: (book: Book) => void;
  onToggleFavorite: (bookId: string) => void;
}

export function BookCard({ book, isFavorite, onOpen, onToggleFavorite }: BookCardProps) {
  return (
    <Card
      className="flex h-full min-h-[545px] flex-col overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
      onClick={() => onOpen(book)}
    >
      <div className="relative h-[350px] shrink-0 overflow-hidden bg-muted">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(book.id);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-full hover:scale-110 active:scale-95 transition-transform duration-200"
          aria-label="Alternar favorito"
        >
          <Heart
            className={`h-5 w-5 transition-colors duration-200 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-600 dark:text-gray-300"
            }`}
          />
        </button>
      </div>
      <CardContent className="flex flex-1 flex-col p-4">
        <div className="min-h-[58px]">
          <h3 className="font-medium leading-snug text-foreground line-clamp-2">{book.title}</h3>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{book.author}</p>
        </div>

        <div className="mt-1 min-h-[38px]">
          <RatingStars rating={book.rating} readonly size="sm" showLabel />
          <span className="text-xs text-muted-foreground ml-1">({book.reviewCount})</span>
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{book.category}</Badge>
            <Badge variant="outline">{book.language}</Badge>
          </div>
          <AvailabilityPill available={book.available} />
        </div>
      </CardContent>
    </Card>
  );
}

function AvailabilityPill({ available }: { available: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
        available
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-500 dark:text-emerald-300"
          : "border-amber-400/30 bg-amber-400/10 text-amber-600 dark:text-amber-300"
      }`}
    >
      {available ? "Disponible" : "No disponible"}
    </span>
  );
}
