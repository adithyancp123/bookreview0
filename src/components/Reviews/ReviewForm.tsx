import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { StarRating } from '../UI/StarRating';
import { LoadingSpinner } from '../UI/LoadingSpinner';

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<{ success: boolean; error?: string }>;
  loading?: boolean;
}

export function ReviewForm({ onSubmit, loading }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (comment.trim().length < 10) {
      setError('Please write at least 10 characters for your review');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await onSubmit(rating, comment.trim());
    
    if (result.success) {
      setRating(0);
      setComment('');
    } else {
      setError(result.error || 'Failed to submit review');
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating *
        </label>
        <StarRating
          rating={rating}
          interactive
          onRatingChange={setRating}
          size="lg"
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Your Review *
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this book..."
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
          disabled={isSubmitting || loading}
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/500 characters (minimum 10)
        </p>
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting || loading || rating === 0 || comment.trim().length < 10}
        className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" />
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            <span>Submit Review</span>
          </>
        )}
      </button>
    </form>
  );
}