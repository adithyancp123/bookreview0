import React from 'react';
import { BookOpen, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-8 w-8 text-primary-400" />
              <span className="text-2xl font-bold font-serif">BookShelf</span>
            </div>
            <p className="text-gray-400 dark:text-gray-300 mb-4 max-w-md">
              Discover your next favorite book and connect with fellow readers. 
              Share reviews, ratings, and recommendations in our growing community.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>for book lovers</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400 dark:text-gray-300">
              <li>
                <a href="/books" className="hover:text-white transition-colors">
                  Browse Books
                </a>
              </li>
              <li>
                <a href="/books?genre=fiction" className="hover:text-white transition-colors">
                  Fiction
                </a>
              </li>
              <li>
                <a href="/books?genre=non-fiction" className="hover:text-white transition-colors">
                  Non-Fiction
                </a>
              </li>
              <li>
                <a href="/books?genre=science-fiction" className="hover:text-white transition-colors">
                  Science Fiction
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-gray-400 dark:text-gray-300">
              <li>
                <a href="/profile" className="hover:text-white transition-colors">
                  My Profile
                </a>
              </li>
              <li>
                <a href="/signin" className="hover:text-white transition-colors">
                  Sign In
                </a>
              </li>
              <li>
                <a href="/signup" className="hover:text-white transition-colors">
                  Join Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center text-gray-400 dark:text-gray-300">
          <p>&copy; 2024 BookShelf. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}