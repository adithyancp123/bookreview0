import { Router } from 'express';
import { all, run } from '../db.js';
import { validateNewReview } from '../models/Review.js';

const router = Router();

router.get('/:book_id', (req, res) => {
  const bookId = Number(req.params.book_id);
  const reviews = all(
    `SELECT id, book_id, user_id, rating, comment FROM reviews WHERE book_id = @book_id ORDER BY id DESC`,
    { book_id: bookId }
  );
  res.json(reviews);
});

router.post('/', (req, res) => {
  const check = validateNewReview(req.body);
  if (!check.ok) return res.status(400).json({ error: check.error });
  const { book_id, user_id, rating, comment } = req.body;
  const info = run(
    `INSERT INTO reviews (book_id, user_id, rating, comment) VALUES (@book_id, @user_id, @rating, @comment)`,
    { book_id, user_id, rating, comment: comment || null }
  );
  res.status(201).json({ id: info.lastInsertRowid });
});

export default router;


