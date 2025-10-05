/*
  # Initial Schema for Book Review Platform

  1. New Tables
    - `books`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `author` (text, not null)
      - `isbn` (text, unique)
      - `description` (text)
      - `genre` (text, not null)
      - `publication_date` (date)
      - `cover_image` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `reviews`
      - `id` (uuid, primary key)
      - `book_id` (uuid, foreign key to books)
      - `user_id` (uuid, foreign key to auth.users)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `profiles`
      - `id` (uuid, primary key, foreign key to auth.users)
      - `email` (text, not null)
      - `full_name` (text, not null)
      - `avatar_url` (text)
      - `bio` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Books are readable by all, writable by authenticated users
    - Reviews are readable by all, writable by authenticated users for their own reviews
    - Profiles are readable by all, writable by users for their own profile
*/

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  isbn text UNIQUE,
  description text,
  genre text NOT NULL,
  publication_date date NOT NULL,
  cover_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(book_id, user_id)
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Books policies
CREATE POLICY "Books are viewable by everyone"
  ON books FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update books"
  ON books FOR UPDATE
  TO authenticated
  USING (true);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert their own reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);