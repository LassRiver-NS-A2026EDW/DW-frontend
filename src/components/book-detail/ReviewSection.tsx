import { LogIn } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { EmptyState } from "../EmptyState";
import { RatingStars } from "../RatingStars";
import { ReviewComment } from "../reviews/ReviewComment";
import type { Review, User } from "../../mocks/mockData";

interface ReviewSectionProps {
  reviews: Review[];
  currentUser: User | null;
  userReview?: Review;
  rating: number;
  comment: string;
  onRatingChange: (value: number) => void;
  onCommentChange: (value: string) => void;
  onSubmitReview: () => void;
  onRequestLogin: () => void;
  onRequestDeleteReview: () => void;
}

export function ReviewSection({
  reviews,
  currentUser,
  userReview,
  rating,
  comment,
  onRatingChange,
  onCommentChange,
  onSubmitReview,
  onRequestLogin,
  onRequestDeleteReview,
}: ReviewSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resenas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentUser && !userReview && (
          <div className="space-y-4 p-6 bg-muted/30 rounded-xl border border-border">
            <div>
              <label className="text-sm font-medium mb-3 block">Tu Calificacion</label>
              <RatingStars rating={rating} onRatingChange={onRatingChange} size="lg" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tu Resena ({comment.length}/2000)</label>
              <Textarea
                placeholder="Comparte tu opinion sobre este libro..."
                value={comment}
                onChange={(event) => onCommentChange(event.target.value.slice(0, 2000))}
                rows={4}
              />
            </div>
            <Button onClick={onSubmitReview}>Publicar Resena</Button>
          </div>
        )}

        {!currentUser && (
          <EmptyState
            icon={LogIn}
            title="Inicia sesion para escribir resenas"
            description="Comparte tu opinion sobre este libro con la comunidad"
            actionLabel="Iniciar Sesion"
            onAction={onRequestLogin}
          />
        )}

        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              canDelete={currentUser?.id === review.userId}
              onRequestDelete={onRequestDeleteReview}
            />
          ))}
          {reviews.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No hay resenas aun. Se el primero en escribir una.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewItem({
  review,
  canDelete,
  onRequestDelete,
}: {
  review: Review;
  canDelete: boolean;
  onRequestDelete: () => void;
}) {
  return (
    <div className="min-w-0 overflow-hidden p-5 bg-card border border-border rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="font-semibold text-foreground">{review.userName}</p>
          <div className="flex items-center gap-3 mt-2">
            <RatingStars rating={review.rating} readonly size="sm" />
            <span className="text-xs text-muted-foreground">{review.date}</span>
          </div>
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRequestDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
          >
            Eliminar
          </Button>
        )}
      </div>
      <ReviewComment>{review.comment}</ReviewComment>
    </div>
  );
}
