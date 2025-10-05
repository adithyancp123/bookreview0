SELECT id, title, author_id, genre, published_year FROM books LIMIT 10;
SELECT id, name FROM authors LIMIT 10;
SELECT id, name, email FROM users LIMIT 10;
SELECT id, book_id, user_id, rating, comment FROM reviews LIMIT 10;

-- Some helpful joins
SELECT b.id, b.title, a.name AS author, b.genre, b.published_year
FROM books b
JOIN authors a ON a.id = b.author_id
ORDER BY b.id DESC
LIMIT 10;

SELECT r.id, b.title, u.name AS reviewer, r.rating
FROM reviews r
JOIN books b ON b.id = r.book_id
JOIN users u ON u.id = r.user_id
ORDER BY r.id DESC
LIMIT 10;


