import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initDb, initSchema } from './db.js';
import { seedIfEmpty } from './utils/seedIfEmpty.js';
import { seedGoogleBooks } from './utils/seedGoogleBooks.js';
import booksRouter from './routes/books.js';
import authorsRouter from './routes/authors.js';
import reviewsRouter from './routes/reviews.js';

dotenv.config();

async function start() {
  await initDb();
  initSchema();
  seedIfEmpty().catch((e) => console.error('Seed error:', e));

  // Seed multiple genres from Google Books (uses GOOGLE_BOOKS_API_KEY if set)
  const seedSubjects = ['fiction', 'fantasy', 'romance', 'history', 'mystery'];
  seedGoogleBooks(seedSubjects, 120, process.env.GOOGLE_BOOKS_API_KEY)
    .catch((e) => console.error('Google Books seed error:', e));

  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/books', booksRouter);
  app.use('/authors', authorsRouter);
  app.use('/reviews', reviewsRouter);

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log('Endpoints:');
    console.log('GET    /books');
    console.log('GET    /books/search?query=...');
    console.log('GET    /books/:id');
    console.log('GET    /books/genre/:genre');
    console.log('GET    /authors');
    console.log('GET    /reviews/:book_id');
    console.log('POST   /reviews');
  });
}

start().catch((e) => {
  console.error('Failed to start server', e);
  process.exit(1);
});


