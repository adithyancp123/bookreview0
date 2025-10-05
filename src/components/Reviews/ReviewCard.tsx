import React from 'react';
import { Calendar, User } from 'lucide-react';
import { Review } from '../../types';
import { StarRating } from '../UI/StarRating';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            {review.user?.avatar_url ? (
              <img
                src={review.user.avatar_url}
                alt={review.user.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-primary-600" />
            )}
          </div>
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium text-gray-900">
                {review.user?.full_name || 'Anonymous User'}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <StarRating rating={review.rating} size="sm" />
                <span className="text-sm text-gray-500">
                  ({review.rating}/5)
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <p className="text-gray-700 leading-relaxed">
            {review.comment}
          </p>
        </div>
      </div>
    </div>
  );
}