import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, MessageCircle } from 'lucide-react';
import { useBook } from '../hooks/useBooks';
import { useReviews } from '../hooks/useReviews';
import { useAuth } from '../contexts/AuthContext';
import { StarRating } from '../components/UI/StarRating';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { ReviewCard } from '../components/Reviews/ReviewCard';
import { ReviewForm } from '../components/Reviews/ReviewForm';

export function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { book, loading: bookLoading, error: bookError } = useBook(id!);
  const { reviews, loading: reviewsLoading, addReview, refetch: refetchReviews } = useReviews(id!);

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!user) {
      return { success: false, error: 'Please sign in to submit a review' };
    }

    const result = await addReview(rating, comment, user.id);
    if (result.success) {
      await refetchReviews();
    }
    return result;
  };

  if (bookLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (bookError || !book) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{bookError || 'Book not found'}</p>
          <Link
            to="/books"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/books"
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Books</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Cover and Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <div className="aspect-[3/4] mb-6 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={book.cover_image || `https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=600`}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=600`;
                  }}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full capitalize">
                    {book.genre}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <StarRating rating={book.average_rating} size="md" />
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <MessageCircle className="h-4 w-4" />
                    <span>{book.total_reviews} reviews</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Published {new Date(book.publication_date).getFullYear()}</span>
                  </div>
                  {book.isbn && (
                    <p className="text-sm text-gray-600 mt-2">
                      ISBN: {book.isbn}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Book Details and Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Book Details */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-6">by {book.author}</p>
              
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{book.description}</p>
              </div>
            </div>

            {/* Review Form */}
            {user && (
              <ReviewForm onSubmit={handleReviewSubmit} />
            )}

            {!user && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 text-center">
                <p className="text-primary-700 mb-4">
                  Want to share your thoughts about this book?
                </p>
                <div className="space-x-4">
                  <Link
                    to="/signin"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-white text-primary-600 px-4 py-2 rounded-lg border border-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Reviews ({book.total_reviews})
              </h3>

              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No reviews yet.</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Be the first to share your thoughts about this book!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}