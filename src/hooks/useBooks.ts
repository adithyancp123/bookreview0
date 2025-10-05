import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Book } from '../types';

export function useBooks(searchTerm?: string, genre?: string, page = 1, limit = 12) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchBooks();
  }, [searchTerm, genre, page, limit]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('books')
        .select('*, reviews(rating)', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`);
      }

      if (genre && genre !== 'all') {
        query = query.eq('genre', genre);
      }

      const { data, error: fetchError, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Calculate average ratings and total reviews for each book
      const booksWithRatings = data?.map(book => {
        const reviews = book.reviews || [];
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews
          : 0;

        return {
          ...book,
          reviews: undefined, // Remove reviews array from book object
          average_rating: Math.round(averageRating * 10) / 10,
          total_reviews: totalReviews,
        };
      }) || [];

      setBooks(booksWithRatings);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { books, loading, error, totalCount, refetch: fetchBooks };
}

export function useBook(id: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBook();
    }
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('books')
        .select('*, reviews(rating)')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Calculate average rating and total reviews
      const reviews = data.reviews || [];
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews
        : 0;

      setBook({
        ...data,
        reviews: undefined,
        average_rating: Math.round(averageRating * 10) / 10,
        total_reviews: totalReviews,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { book, loading, error, refetch: fetchBook };
}