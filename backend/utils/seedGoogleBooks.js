import fetch from 'node-fetch';
import { run, get } from '../db.js';

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

export async function seedGoogleBooks(subjects = ['fiction'], maxPerSubject = 120, apiKey = process.env.GOOGLE_BOOKS_API_KEY) {
  let totalInserted = 0;

  for (const subject of subjects) {
    let insertedForSubject = 0;
    // Google Books returns up to 40 per request; paginate by 40
    for (let startIndex = 0; startIndex < maxPerSubject; startIndex += 40) {
      const items = await fetchPage(subject, startIndex, Math.min(40, maxPerSubject - startIndex), apiKey);
      if (items.length === 0) break;

      for (const item of items) {
        const volume = item.volumeInfo || {};
        const title = (volume.title || '').trim();
        if (!title) continue;

        const existing = get('SELECT id FROM books WHERE title = @title', { title });
        if (existing) continue;

        run(
          `INSERT OR IGNORE INTO books (title, genre) VALUES (@title, @genre)`,
          { title, genre: subject }
        );
        insertedForSubject++;
        totalInserted++;
      }
    }
    console.log(`✅ Inserted ${insertedForSubject} books for subject "${subject}"`);
  }

  console.log(`✅ Inserted ${totalInserted} books from Google Books API into database.`);
}


