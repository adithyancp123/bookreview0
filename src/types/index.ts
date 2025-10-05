export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  description: string;
  genre: string;
  publication_date: string;
  cover_image: string;
  created_at: string;
  updated_at: string;
  average_rating: number;
  total_reviews: number;
}

export interface Review {
  id: string;
  book_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}