# Book Review Platform Backend (Node.js/Express/Postgres)

This is the backend API for the Book Review Platform, built with Node.js, Express, Sequelize, and PostgreSQL.

## Features
- RESTful API for books, reviews, and users
- User registration and login with JWT authentication
- Admin-only book creation
- Data validation and error handling
- SQL (Postgres) for data persistence

## Prerequisites
- Node.js (v16+ recommended)
- npm
- PostgreSQL (local or cloud, e.g. [Postgres.app](https://postgresapp.com/) or [ElephantSQL](https://www.elephantsql.com/))

## Setup Instructions

1. **Clone the repository and navigate to the backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env` and update with your Postgres credentials:
     ```
     PORT=5000
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=bookreview
     DB_USER=your_postgres_user
     DB_PASS=your_postgres_password
     JWT_SECRET=your_jwt_secret
     ```
   - Make sure your Postgres server is running and the database exists.

4. **Start the backend server:**
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000` by default.

5. **Test the API:**
   - Use Postman, Insomnia, or curl to test endpoints:
     - `POST /api/auth/register` — Register a new user
     - `POST /api/auth/login` — Login and get a JWT
     - `GET /api/books` — List all books
     - `POST /api/books` — Add a book (admin only)
     - `GET /api/reviews?bookId=BOOK_ID` — Get reviews for a book
     - `POST /api/reviews` — Add a review (authenticated)
     - `GET /api/users/:id` — Get user profile (authenticated)
     - `PUT /api/users/:id` — Update user profile (authenticated)

6. **Connect your React frontend:**
   - Update your frontend API calls to use `http://localhost:5000/api/...`
   - Store the JWT token after login/register and send it in the `Authorization` header for protected endpoints.

## Additional Notes
- The backend uses Sequelize ORM for Postgres. Models are in `models/`.
- Authentication is handled with JWT. Use the `/api/auth/register` and `/api/auth/login` endpoints to get a token.
- For admin-only actions, set the user's `role` to `admin` in the database.
- Error handling middleware is included for consistent API responses.
- CORS is enabled for local development.

## Troubleshooting
- If you get database connection errors, check your `.env` and ensure Postgres is running.
- If you get 401/403 errors, make sure you are sending the JWT token in the `Authorization` header.
- For any issues, check the backend terminal output for error messages.

---

Feel free to open an issue or ask for help if you get stuck! 