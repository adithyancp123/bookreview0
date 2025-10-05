import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  className = '',
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const stars = Array.from({ length: maxRating }, (_, index) => {
    const starRating = index + 1;
    const isFilled = starRating <= rating;
    const isHalfFilled = starRating - 0.5 === rating;

    return (
      <button
        key={index}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onRatingChange?.(starRating)}
        className={`${
          interactive
            ? 'cursor-pointer hover:scale-110 transition-transform'
            : 'cursor-default'
        } ${sizeClasses[size]}`}
      >
        <Star
          className={`${sizeClasses[size]} ${
            isFilled || isHalfFilled
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          } transition-colors`}
        />
      </button>
    );
  });

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {stars}
      {!interactive && (
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}