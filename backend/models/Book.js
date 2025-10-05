export function mapWorkToBook(work, authorId) {
  const title = work.title?.trim() || 'Untitled';
  const description = typeof work.description === 'string' ? work.description : work.description?.value || null;
  const year = work.first_publish_year || null;
  const coverId = work.cover_id || work.cover_i;
  const imageUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null;
  return {
    title,
    author_id: authorId,
    genre: 'Fiction',
    description,
    rating: null,
    image_url: imageUrl,
    published_year: year,
  };
}


