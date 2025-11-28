import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readonly = false,
  size = 24,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const displayRating = hoverRating || value;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
          className={`transition-colors ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } transform transition-transform duration-150`}
          aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
        >
          <Star
            size={size}
            className={`${
              star <= displayRating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-none text-gray-300"
            } transition-colors duration-150`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
