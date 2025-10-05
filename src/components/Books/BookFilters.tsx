import React from 'react';
import { Filter } from 'lucide-react';

interface BookFiltersProps {
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export const genres = [
  { value: 'all', label: 'All Genres' },
  { value: 'fiction', label: 'Fiction' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'romance', label: 'Romance' },
  { value: 'science-fiction', label: 'Science Fiction' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'biography', label: 'Biography' },
  { value: 'history', label: 'History' },
  { value: 'self-help', label: 'Self-Help' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'title-desc', label: 'Title Z-A' },
  { value: 'author-asc', label: 'Author A-Z' },
  { value: 'rating-desc', label: 'Highest Rated' },
];

export function BookFilters({
  selectedGenre,
  onGenreChange,
  sortBy,
  onSortChange,
}: BookFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Genre Filter */}
        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
            Genre
          </label>
          <select
            id="genre"
            value={selectedGenre}
            onChange={(e) => onGenreChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          >
            {genres.map((genre) => (
              <option key={genre.value} value={genre.value}>
                {genre.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}