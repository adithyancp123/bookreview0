export function validateNewReview(payload) {
  const rating = Number(payload.rating);
  if (!payload.book_id) return { ok: false, error: 'book_id is required' };
  if (!payload.user_id) return { ok: false, error: 'user_id is required' };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { ok: false, error: 'rating must be 1-5' };
  return { ok: true };
}


