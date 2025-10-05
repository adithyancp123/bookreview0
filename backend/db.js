import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const DATA_DIR = path.join(process.cwd(), 'backend', 'data');
const DB_PATH = path.join(DATA_DIR, 'books.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const db = new Database(DB_PATH);

// Improve performance for bulk inserts
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

export function withTransaction(fn) {
  const txn = db.transaction(fn);
  return txn();
}

export function run(sql, params = {}) {
  return db.prepare(sql).run(params);
}

export function all(sql, params = {}) {
  return db.prepare(sql).all(params);
}

export function get(sql, params = {}) {
  return db.prepare(sql).get(params);
}


