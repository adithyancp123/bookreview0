import { Router } from 'express';
import { all, get as getRow, run, withTransaction } from '../db.js';
import fetch from 'node-fetch';

// Simple in-memory cache for search results
const searchCache = new Map(); // key: query, value: { ts, results }
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function normalizeQuery(q) {
  return String(q || '').trim().toLowerCase();
}

const router = Router();

// GET /books - returns all books from the database
router.get('/', (_req, res) => {
  const books = all(`
    SELECT * FROM books
    ORDER BY rating DESC NULLS LAST, id DESC
  `);
  res.json(books);
});

// GET /books/genre/:genre - returns all books by genre
router.get('/genre/:genre', (req, res) => {
  const genre = normalizeQuery(req.params.genre);
  
  if (!genre) {
    return res.status(400).json({ error: 'Genre parameter is required' });
  }
  
  const books = all(
    `SELECT * FROM books WHERE lower(genre) = @genre ORDER BY rating DESC NULLS LAST, id DESC`,
    { genre }
  );
  
  res.json(books);
});

// GET /books/search?query=harry+potter
router.get('/search', async (req, res) => {
  const query = normalizeQuery(req.query.query);
  console.log(`[search] incoming query=\"${query}\"`);

  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  const cached = searchCache.get(query);
  if (cached && (Date.now() - cached.ts) < CACHE_TTL_MS) {
    console.log(`[search] cache hit for \"${query}\"`);
    return res.json(cached.results);
  }

  try {
    // DB search first
    const dbResults = all(
      `SELECT * FROM books WHERE lower(title) LIKE '%' || @q || '%' ORDER BY id DESC`,
      { q: query }
    );
    if (dbResults.length > 0) {
      searchCache.set(query, { ts: Date.now(), results: dbResults });
      console.log(`[search] db hit for \"${query}\" -> ${dbResults.length} rows`);
      return res.json(dbResults);
    }

    // Fallback to Google Books API
    const params = new URLSearchParams({ q: query, maxResults: '20' });
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    params.set('key', apiKey);
    const url = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;
    console.log(`[search] fetching Google Books: ${url}`);
    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text();
      console.error(`[search] Google Books error ${resp.status}: ${text}`);
      return res.status(502).json({ error: 'Upstream Google Books API error' });
    }
    const json = await resp.json();
    const items = Array.isArray(json.items) ? json.items : [];

    const mapped = items.map((item) => {
      const v = item.volumeInfo || {};
      const title = (v.title || '').trim();
      const author = Array.isArray(v.authors) && v.authors.length > 0 ? v.authors[0] : null;
      const description = v.description || null;
      const genre = Array.isArray(v.categories) && v.categories.length > 0 ? v.categories[0] : null;
      const published_year = typeof v.publishedDate === 'string' ? parseInt(v.publishedDate.slice(0, 4), 10) : null;
      const rating = typeof v.averageRating === 'number' ? v.averageRating : null;
      const image_url = v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || null;
      return { title, author, description, genre, published_year: Number.isFinite(published_year) ? published_year : null, rating, image_url };
    }).filter(b => b.title);

    // Insert into DB (skip duplicates by title)
    withTransaction(() => {
      for (const b of mapped) {
        run(
          `INSERT OR IGNORE INTO books (title, genre, description, image_url, published_year, rating)
           VALUES (@title, @genre, @description, @image_url, @published_year, @rating)`,
          b
        );
      }
    });

    // Re-query DB to return consistent rows (with ids)
    const titles = mapped.map(m => m.title);
    let results = [];
    if (titles.length > 0) {
      // Build dynamic placeholders safely
      const placeholders = titles.map((_, i) => `@t${i}`).join(',');
      const params = Object.fromEntries(titles.map((t, i) => [`t${i}`, t.toLowerCase()]));
      results = all(
        `SELECT * FROM books WHERE lower(title) IN (${placeholders}) ORDER BY id DESC`,
        params
      );
    }

    console.log(`[search] google -> inserted/selected ${results.length} rows for \"${query}\"`);
    searchCache.set(query, { ts: Date.now(), results });
    return res.json(results);
  } catch (err) {
    console.error('[search] error', err);
    return res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/genre/:genre', (req, res) => {
  const genre = String(req.params.genre);
  const books = all(
    `SELECT * FROM books WHERE genre = @genre ORDER BY id DESC`,
    { genre }
  );
  res.json(books);
});

router.get('/:id', (req, res) => {
  const book = getRow(`SELECT * FROM books WHERE id = @id`, { id: Number(req.params.id) });
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

export default router;


