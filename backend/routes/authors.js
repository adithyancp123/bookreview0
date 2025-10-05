import { Router } from 'express';
import { all } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const authors = all('SELECT * FROM authors ORDER BY name ASC');
  res.json(authors);
});

export default router;


