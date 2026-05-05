import { Star } from "lucide-react";
import { useState } from "react";

interface RatingStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function RatingStars({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
  showLabel = false,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const starSize = sizeClasses[size];

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= (hoverRating || rating);
          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              onClick={() => onRatingChange?.(star)}
              onMouseEnter={() => !readonly && setHoverRating(star)}
              onMouseLeave={() => !readonly && setHoverRating(0)}
              className={`transition-all ${
                readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
              }`}
            >
              <Star
                className={`${starSize} ${
                  isActive
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            </button>
          );
        })}
      </div>
      {showLabel && (
        <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
