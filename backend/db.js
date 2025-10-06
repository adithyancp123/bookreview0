import initSqlJs from 'sql.js';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Database file path
const DATA_DIR = path.join(process.cwd(), 'backend', 'data');
const DB_PATH = path.join(DATA_DIR, 'books.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let SQL;
let db;

export async function initDb() {
  if (!SQL) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const wasmPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');

    if (!fs.existsSync(wasmPath)) {
      console.warn('⚠️ sql-wasm.wasm file not found — creating a dummy one...');
      fs.mkdirSync(path.dirname(wasmPath), { recursive: true });
      fs.writeFileSync(wasmPath, '');
    }

    SQL = await initSqlJs({ locateFile: () => wasmPath });
  }

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    persist();
  }
}

export function persist() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export function withTransaction(fn) {
  db.run('BEGIN');
  try {
    const result = fn();
    db.run('COMMIT');
    persist();
    return result;
  } catch (e) {
    db.run('ROLLBACK');
    throw e;
  }
}

function bindAndExec(sql, params = {}) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  return stmt;
}

export function run(sql, params = {}) {
  const stmt = bindAndExec(sql, params);
  stmt.step();
  stmt.free();
  persist();
  return { changes: 1 };
}

export function all(sql, params = {}) {
  const stmt = bindAndExec(sql, params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

export function get(sql, params = {}) {
  const stmt = bindAndExec(sql, params);
  const hasRow = stmt.step();
  const row = hasRow ? stmt.getAsObject() : undefined;
  stmt.free();
  return row;
}

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS authors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      bio TEXT
    );
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE,
      author_id INTEGER,
      genre TEXT,
      description TEXT,
      rating REAL,
      image_url TEXT,
      published_year INTEGER
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER CHECK(rating BETWEEN 1 AND 5),
      comment TEXT,
      FOREIGN KEY(book_id) REFERENCES books(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
  persist();
}
