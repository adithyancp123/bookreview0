import fs from 'node:fs';
import path from 'node:path';
import fetch from 'node-fetch';
import { db, withTransaction, run, get } from './db.js';

const SCHEMA_PATH = path.join(process.cwd(), 'backend', 'schema.sql');

async function ensureSchema() {
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schemaSql);
}

async function fetchOpenLibraryFiction(limit = 100) {
  const perRequest = Math.min(limit, 100);
  const url = `https://openlibrary.org/subjects/fiction.json?limit=${perRequest}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open Library request failed: ${res.status}`);
  const json = await res.json();
  return json.works || [];
}

function upsertAuthor(name) {
  if (!name) return null;
  const existing = get('SELECT id FROM authors WHERE name = @name', { name });
  if (existing) return existing.id;
  const info = run('INSERT INTO authors (name) VALUES (@name)', { name });
  return info.lastInsertRowid;
}

function insertBook(book) {
  const info = run(
    `INSERT INTO books (title, author_id, genre, description, rating, image_url, published_year)
     VALUES (@title, @author_id, @genre, @description, @rating, @image_url, @published_year)`,
    book
  );
  return info.lastInsertRowid;
}

function seedUsers(count = 10) {
  const created = [];
  for (let i = 1; i <= count; i++) {
    const name = `User ${i}`;
    const email = `user${i}@example.com`;
    try {
      run('INSERT INTO users (name, email) VALUES (@name, @email)', { name, email });
      created.push({ id: db.prepare('SELECT last_insert_rowid() as id').get().id, name });
    } catch {
      // ignore duplicates
    }
  }
  return db.prepare('SELECT id, name FROM users').all();
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function maybe(val, fallback = null) {
  return val === undefined || val === null ? fallback : val;
}

async function main() {
  await ensureSchema();

  const works = await fetchOpenLibraryFiction(100);
  const users = seedUsers(15);

  withTransaction(() => {
    for (const work of works) {
      const title = work.title?.trim();
      if (!title) continue;
      const authorName = work.authors?.[0]?.name?.trim() || 'Unknown Author';
      const authorId = upsertAuthor(authorName);
      if (!authorId) continue;

      const description = typeof work.description === 'string'
        ? work.description
        : work.description?.value || '';
      const year = work.first_publish_year || null;
      const coverId = work.cover_id || work.cover_i;
      const imageUrl = coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        : null;
      const rating = Number.isFinite(work.rating)
        ? maybe(work.rating, null)
        : maybe(work.average_rating, null);

      const bookId = insertBook({
        title,
        author_id: authorId,
        genre: 'Fiction',
        description: description || null,
        rating: rating || null,
        image_url: imageUrl,
        published_year: year,
      });

      // Create 1-3 random reviews
      const reviewCount = randomInt(1, 3);
      for (let i = 0; i < reviewCount; i++) {
        const user = users[randomInt(0, users.length - 1)];
        const r = randomInt(3, 5);
        const comment = `Rated ${r} by ${user.name}`;
        run(
          `INSERT INTO reviews (book_id, user_id, rating, comment)
           VALUES (@book_id, @user_id, @rating, @comment)`,
          { book_id: bookId, user_id: user.id, rating: r, comment }
        );
      }
    }
  });

  const counts = {
    authors: db.prepare('SELECT COUNT(*) as c FROM authors').get().c,
    books: db.prepare('SELECT COUNT(*) as c FROM books').get().c,
    users: db.prepare('SELECT COUNT(*) as c FROM users').get().c,
    reviews: db.prepare('SELECT COUNT(*) as c FROM reviews').get().c,
  };

  console.log('Seed completed:', counts);
  console.log('\nSample verification queries:');
  console.log('SELECT id, title, published_year FROM books LIMIT 10;');
  console.log('SELECT id, name FROM authors LIMIT 10;');
  console.log('SELECT id, book_id, user_id, rating FROM reviews LIMIT 10;');
  console.log('SELECT id, name, email FROM users LIMIT 10;');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


