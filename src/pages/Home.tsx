import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, Users, TrendingUp } from 'lucide-react';
import { useBooks } from '../hooks/useBooks';
import { BookCard } from '../components/Books/BookCard';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';

export function Home() {
  const { books: featuredBooks, loading } = useBooks('', 'all', 1, 8);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 font-serif">
              Discover Your Next
              <span className="text-primary-600 block">Great Read</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of book lovers sharing reviews, discovering new stories, 
              and building a community around the books that shape our lives.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/books"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg"
              >
                Browse Books
              </Link>
              <Link
                to="/signup"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors font-semibold text-lg"
              >
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">10,000+</h3>
              <p className="text-gray-600 dark:text-gray-300">Books Available</p>
            </div>
            <div className="text-center">
              <div className="bg-accent-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">50,000+</h3>
              <p className="text-gray-600 dark:text-gray-300">Reviews Written</p>
            </div>
            <div className="text-center">
              <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">5,000+</h3>
              <p className="text-gray-600 dark:text-gray-300">Active Readers</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">4.8/5</h3>
              <p className="text-gray-600 dark:text-gray-300">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Featured Books</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Discover the most popular and highly-rated books in our collection
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {featuredBooks.slice(0, 8).map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
              
              <div className="text-center">
                <Link
                  to="/books"
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  View All Books
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Reading Journey?
          </h2>
          <p className="text-primary-100 dark:text-primary-200 text-lg mb-8 max-w-2xl mx-auto">
            Join our community of book lovers and start discovering, reviewing, 
            and sharing your favorite books today.
          </p>
          <Link
            to="/signup"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
          >
            Get Started for Free
          </Link>
        </div>
      </section>
    </div>
  );
}