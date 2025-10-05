import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Review } from '../types';

export function useReviews(bookId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookId) {
      fetchReviews();
    }
  }, [bookId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const reviewsWithUser = data?.map(review => ({
        ...review,
        user: review.profiles,
        profiles: undefined,
      })) || [];

      setReviews(reviewsWithUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addReview = async (rating: number, comment: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          book_id: bookId,
          user_id: userId,
          rating,
          comment,
        });

      if (error) throw error;
      await fetchReviews();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to add review' 
      };
    }
  };

  return { reviews, loading, error, addReview, refetch: fetchReviews };
}