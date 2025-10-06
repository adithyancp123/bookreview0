import fetch from 'node-fetch';
import { run, get, withTransaction } from '../db.js';

async function fetchPage(subject, startIndex, maxResults, apiKey) {
  const params = new URLSearchParams({
    q: `subject:${subject}`,
    maxResults: String(maxResults),
    startIndex: String(startIndex),
  });
  if (apiKey) params.set('key', apiKey);
  const url = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Books request failed: ${res.status}`);
  const json = await res.json();
  return Array.isArray(json.items) ? json.items : [];
}

function upsertAuthor(name) {
  if (!name) return null;
  const existing = get('SELECT id FROM authors WHERE name = @name', { name });
  if (existing) return existing.id;
  // INSERT OR IGNORE guarded by UNIQUE(name)
  run('INSERT OR IGNORE INTO authors (name) VALUES (@name)', { name });
  const created = get('SELECT id FROM authors WHERE name = @name', { name });
  return created?.id;
}

export async function seedGoogleBooks(subjects = ['fiction'], maxPerSubject = 120, apiKey = process.env.GOOGLE_BOOKS_API_KEY) {
  let totalInserted = 0;

  for (const subject of subjects) {
    let insertedForSubject = 0;
    // Google Books returns up to 40 per request; paginate by 40
    for (let startIndex = 0; startIndex < maxPerSubject; startIndex += 40) {
      const items = await fetchPage(subject, startIndex, Math.min(40, maxPerSubject - startIndex), apiKey);
      if (items.length === 0) break;

      withTransaction(() => {
        for (const item of items) {
          const volume = item.volumeInfo || {};
          const title = (volume.title || '').trim();
          if (!title) continue;

          // Get author information
          const authorName = Array.isArray(volume.authors) && volume.authors.length > 0 
            ? volume.authors[0].trim() 
            : 'Unknown Author';
          
          // Upsert author and get author_id
          const authorId = upsertAuthor(authorName);
          if (!authorId) continue;

          // Extract additional book data
          const description = volume.description || null;
          const published_year = typeof volume.publishedDate === 'string' 
            ? parseInt(volume.publishedDate.slice(0, 4), 10) 
            : null;
          const rating = typeof volume.averageRating === 'number' ? volume.averageRating : null;
          const image_url = volume.imageLinks?.thumbnail || volume.imageLinks?.smallThumbnail || null;
          const isbn = volume.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier || 
                      volume.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || null;

          // Check if book already exists
          const existing = get('SELECT id FROM books WHERE title = @title', { title });
          if (existing) continue;

          // Insert book with all available data
          run(
            `INSERT OR IGNORE INTO books (title, author_id, genre, description, rating, image_url, published_year)
             VALUES (@title, @author_id, @genre, @description, @rating, @image_url, @published_year)`,
            { 
              title, 
              author_id: authorId,
              genre: subject,
              description,
              rating,
              image_url,
              published_year: Number.isFinite(published_year) ? published_year : null
            }
          );
          
          insertedForSubject++;
          totalInserted++;
        }
      });
    }
    console.log(`✅ Inserted ${insertedForSubject} books for subject "${subject}"`);
  }

  console.log(`✅ Inserted ${totalInserted} books from Google Books API into database.`);
}


