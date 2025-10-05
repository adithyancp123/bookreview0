import fetch from 'node-fetch';
import { all, run, get, withTransaction } from '../db.js';

function upsertAuthor(name) {
  const existing = get('SELECT id FROM authors WHERE name = @name', { name });
  if (existing) return existing.id;
  // INSERT OR IGNORE guarded by UNIQUE(name)
  run('INSERT OR IGNORE INTO authors (name) VALUES (@name)', { name });
  const created = get('SELECT id FROM authors WHERE name = @name', { name });
  return created?.id;
}

function insertOrIgnoreBook(book) {
  // Requires a UNIQUE(title, author_id) index to avoid duplicates
  run(
    `INSERT OR IGNORE INTO books (title, author_id, genre, description, rating, image_url, published_year)
     VALUES (@title, @author_id, @genre, @description, @rating, @image_url, @published_year)`,
    book
  );
  return get(
    `SELECT id FROM books WHERE title = @title AND author_id = @author_id`,
    { title: book.title, author_id: book.author_id }
  )?.id;
}

function seedUsers(count = 10) {
  for (let i = 1; i <= count; i++) {
    const name = `User ${i}`;
    const email = `user${i}@example.com`;
    run('INSERT OR IGNORE INTO users (name, email) VALUES (@name, @email)', { name, email });
  }
}

export async function seedIfEmpty() {
  const bookCount = get('SELECT COUNT(*) as c FROM books').c;
  if (bookCount > 0) {
    console.log(`DB already has ${bookCount} books. Skipping seed.`);
    return;
  }

  console.log('Seeding database from Open Library (fiction)...');
  const res = await fetch('https://openlibrary.org/subjects/fiction.json?limit=100');
  if (!res.ok) throw new Error(`Open Library failed: ${res.status}`);
  const json = await res.json();
  const works = json.works || [];

  seedUsers(15);

  withTransaction(() => {
    for (const w of works) {
      const title = (w.title || '').trim();
      if (!title) continue;
      const authorName = (w.authors?.[0]?.name || 'Unknown Author').trim();
      const authorId = upsertAuthor(authorName);
      if (!authorId) continue;

      const description = typeof w.description === 'string' ? w.description : w.description?.value || null;
      const year = w.first_publish_year || null;
      const coverId = w.cover_id || w.cover_i;
      const imageUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null;

      const bookId = insertOrIgnoreBook({
        title,
        author_id: authorId,
        genre: 'Fiction',
        description,
        rating: null,
        image_url: imageUrl,
        published_year: year,
      });

      if (!bookId) continue;
    }
  });

  const counts = {
    authors: get('SELECT COUNT(*) as c FROM authors').c,
    books: get('SELECT COUNT(*) as c FROM books').c,
    users: get('SELECT COUNT(*) as c FROM users').c,
  };
  console.log('Seed done:', counts);
}


