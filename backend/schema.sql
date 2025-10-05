-- Authors table
CREATE TABLE IF NOT EXISTS authors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  bio TEXT
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author_id INTEGER NOT NULL,
  genre TEXT,
  description TEXT,
  rating REAL,
  image_url TEXT,
  published_year INTEGER,
  FOREIGN KEY(author_id) REFERENCES authors(id)
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  rating INTEGER CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  FOREIGN KEY(book_id) REFERENCES books(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_reviews_book ON reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);


