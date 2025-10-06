import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { initDb, initSchema } from "./db.js";
import { seedIfEmpty } from "./utils/seedIfEmpty.js";
import { scheduleBookFetching } from "./routes/fetchBooks.js";
import booksRouter from "./routes/books.js";
import authorsRouter from "./routes/authors.js";
import reviewsRouter from "./routes/reviews.js";

dotenv.config();

async function start() {
  console.log("🚀 Starting backend...");

  // --- 1️⃣ Initialize database ---
  await initDb();
  await initSchema();

  // --- 2️⃣ Optional: Seed base data if DB is empty ---
  try {
    await seedIfEmpty();
  } catch (e) {
    console.error("❌ Seed error:", e);
  }

  // --- 3️⃣ Start periodic Google Books fetching ---
  const genres = [
    "fiction",
    "romance",
    "fantasy",
    "history",
    "science",
    "mystery",
    "thriller",
    "biography",
    "children",
    "self-help",
  ];
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  // Runs once immediately and then every 24 hours
  scheduleBookFetching(genres, 200, apiKey, 24);

  // --- 4️⃣ Express setup ---
  const app = express();
  const PORT = process.env.PORT || 5001;

  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  // --- 5️⃣ Health check route ---
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // --- 6️⃣ API routes ---
  app.use("/books", booksRouter);
  app.use("/authors", authorsRouter);
  app.use("/reviews", reviewsRouter);

  // --- 7️⃣ Start listening ---
  app.listen(PORT, () => {
    console.log(`✅ Backend server running at http://localhost:${PORT}`);
    console.log("Available Endpoints:");
    console.log("GET    /books");
    console.log("GET    /books/search?query=...");
    console.log("GET    /books/:id");
    console.log("GET    /books/genre/:genre");
    console.log("GET    /authors");
    console.log("GET    /reviews/:book_id");
    console.log("POST   /reviews");
  });
}

// --- 8️⃣ Run startup ---
start().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
