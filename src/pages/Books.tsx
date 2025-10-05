import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookGrid } from '../components/Books/BookGrid';
import { BookFilters } from '../components/Books/BookFilters';
import { useBooks } from '../hooks/useBooks';

export function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  
  const searchTerm = searchParams.get('search') || '';
  const { books, loading, error, totalCount } = useBooks(searchTerm, selectedGenre, page, 12);
  
  const totalPages = Math.ceil(totalCount / 12);

  useEffect(() => {
    const genre = searchParams.get('genre');
    if (genre) {
      setSelectedGenre(genre);
    }
  }, [searchParams]);

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    setPage(1);
    
    const newParams = new URLSearchParams(searchParams);
    if (genre === 'all') {
      newParams.delete('genre');
    } else {
      newParams.set('genre', genre);
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'Browse Books'}
          </h1>
          <p className="text-gray-600">
            {totalCount > 0 
              ? `Showing ${(page - 1) * 12 + 1}-${Math.min(page * 12, totalCount)} of ${totalCount} books`
              : 'Discover your next favorite read'
            }
          </p>
        </div>

        {!searchTerm && (
          <BookFilters
            selectedGenre={selectedGenre}
            onGenreChange={handleGenreChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
          />
        )}

        <BookGrid books={books} loading={loading} error={error} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      pageNum === page
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}