import React from 'react';
import { BookCard } from './BookCard';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { Book } from '../../types';

interface BookGridProps {
  books: Book[];
  loading: boolean;
  error: string | null;
}

export function BookGrid({ books, loading, error }: BookGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No books found.</p>
        <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}