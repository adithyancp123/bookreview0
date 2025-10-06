import fetch from 'node-fetch';
import { run, get, withTransaction } from '../db.js';

// Track progress for resumable fetching
let fetchProgress = {};

/**
 * Fetch a page of books from Google Books API
 * @param {string} genre - The genre/subject to search for
 * @param {number} startIndex - Starting index for pagination
 * @param {number} maxResults - Maximum results per page (max 40)
 * @param {string} apiKey - Google Books API key
 * @returns {Promise<Array>} - Array of book items
 */
async function fetchPage(genre, startIndex, maxResults, apiKey) {
  const params = new URLSearchParams({
    q: `subject:${genre}`,
    maxResults: String(maxResults),
    startIndex: String(startIndex),
  });
  
  if (apiKey) params.set('key', apiKey);
  
  const url = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error(`Google Books request failed: ${res.status} ${res.statusText}`);
  }
  
  const json = await res.json();
  return Array.isArray(json.items) ? json.items : [];
}

/**
 * Insert or get existing author
 * @param {string} name - Author name
 * @returns {number|null} - Author ID
 */
function upsertAuthor(name) {
  if (!name) return null;
  
  const existing = get('SELECT id FROM authors WHERE name = @name', { name });
  if (existing) return existing.id;
  
  // INSERT OR IGNORE guarded by UNIQUE(name)
  run('INSERT OR IGNORE INTO authors (name) VALUES (@name)', { name });
  const created = get('SELECT id FROM authors WHERE name = @name', { name });
  return created?.id;
}

/**
 * Insert book if it doesn't exist
 * @param {Object} bookData - Book data to insert
 * @returns {boolean} - Whether book was inserted
 */
function insertBookIfNotExists(bookData) {
  const { title, author_id, genre, description, rating, image_url, published_year } = bookData;
  
  // Check if book already exists
  const existing = get('SELECT id FROM books WHERE title = @title AND author_id = @author_id', { 
    title, 
    author_id 
  });
  
  if (existing) return false;
  
  // Insert book with all available data
  run(
    `INSERT OR IGNORE INTO books (
      title, author_id, genre, description, rating, image_url, published_year
    ) VALUES (
      @title, @author_id, @genre, @description, @rating, @image_url, @published_year
    )`,
    { 
      title, 
      author_id,
      genre,
      description,
      rating,
      image_url,
      published_year
    }
  );
  
  return true;
}

/**
 * Fetch books from Google Books API for a specific genre
 * @param {string} genre - Genre to fetch
 * @param {number} maxBooks - Maximum books to fetch
 * @param {string} apiKey - Google Books API key
 * @returns {Promise<number>} - Number of books inserted
 */
export async function fetchBooksByGenre(genre, maxBooks = 200, apiKey) {
  let insertedCount = 0;
  let startIndex = fetchProgress[genre] || 0;
  
  try {
    // Google Books returns up to 40 per request; paginate by 40
    while (startIndex < maxBooks) {
      const pageSize = Math.min(40, maxBooks - startIndex);
      const items = await fetchPage(genre, startIndex, pageSize, apiKey);
      
      // If no more results, break the loop
      if (items.length === 0) break;
      
      // Handle each book insert individually instead of in one transaction
      // to avoid transaction errors
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
          
          // Insert book if it doesn't exist
          const inserted = insertBookIfNotExists({
            title,
            author_id: authorId,
            genre,
            description,
            rating,
            image_url,
            published_year: Number.isFinite(published_year) ? published_year : null
          });
          
          if (inserted) insertedCount++;
        }
      
      // Update progress for resumable fetching
      startIndex += items.length;
      fetchProgress[genre] = startIndex;
      
      console.log(`Fetched ${items.length} books from genre: ${genre} (total: ${insertedCount})`);
    }
    
    console.log(`✅ Inserted ${insertedCount} books for genre "${genre}"`);
    return insertedCount;
  } catch (error) {
    console.error(`Error fetching books for genre "${genre}":`, error);
    // Save progress even on error
    fetchProgress[genre] = startIndex;
    return insertedCount;
  }
}

/**
 * Fetch books from Google Books API for multiple genres
 * @param {Array<string>} genres - List of genres to fetch
 * @param {number} maxPerGenre - Maximum books per genre
 * @param {string} apiKey - Google Books API key
 * @returns {Promise<number>} - Total number of books inserted
 */
export async function fetchAllBooks(
  genres = ["fiction", "romance", "fantasy", "history", "science", "mystery", "thriller", "biography", "children", "self-help"],
  maxPerGenre = 200,
  apiKey = process.env.GOOGLE_BOOKS_API_KEY
) {
  let totalInserted = 0;
  
  for (const genre of genres) {
    const inserted = await fetchBooksByGenre(genre, maxPerGenre, apiKey);
    totalInserted += inserted;
  }
  
  // Get total book count in database
  const countResult = get('SELECT COUNT(*) as count FROM books');
  const totalBooks = countResult?.count || 0;
  
  console.log(`✅ Database now has ${totalBooks} total books`);
  return totalInserted;
}

/**
 * Schedule periodic book fetching
 * @param {Array<string>} genres - List of genres to fetch
 * @param {number} maxPerGenre - Maximum books per genre
 * @param {string} apiKey - Google Books API key
 * @param {number} intervalHours - Hours between fetches
 */
export function scheduleBookFetching(
  genres = ["fiction", "romance", "fantasy", "history", "science", "mystery", "thriller", "biography", "children", "self-help"],
  maxPerGenre = 200,
  apiKey = process.env.GOOGLE_BOOKS_API_KEY,
  intervalHours = 24
) {
  // Initial fetch
  fetchAllBooks(genres, maxPerGenre, apiKey);
  
  // Schedule periodic fetches
  const intervalMs = intervalHours * 60 * 60 * 1000;
  setInterval(() => {
    console.log(`Scheduled book fetching started at ${new Date().toISOString()}`);
    fetchAllBooks(genres, maxPerGenre, apiKey);
  }, intervalMs);
  
  console.log(`Book fetching scheduled to run every ${intervalHours} hours`);
}