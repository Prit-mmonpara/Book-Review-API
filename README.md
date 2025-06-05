# Book Review API

A RESTful API built with Node.js, Express, and MySQL for a basic Book Review system.

## Project Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd book-review-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=users_db
   JWT_SECRET=your_jwt_secret
   ```

4. Set up the MySQL database:
   - Create a database named `users_db`.
   - Run the following SQL commands to create the required tables:

     ```sql
     CREATE TABLE users_db (
       id INT AUTO_INCREMENT PRIMARY KEY,
       username VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL
     );

     CREATE TABLE books (
       id INT AUTO_INCREMENT PRIMARY KEY,
       title VARCHAR(255) NOT NULL,
       author VARCHAR(255) NOT NULL,
       genre VARCHAR(255) NOT NULL,
       description TEXT
     );

     CREATE TABLE reviews (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT NOT NULL,
       book_id INT NOT NULL,
       rating INT NOT NULL,
       comment TEXT,
       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users_db(id),
       FOREIGN KEY (book_id) REFERENCES books(id)
     );
     ```

5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- **POST /auth/signup** - Register a new user
  ```bash
  curl -X POST http://localhost:3000/auth/signup -H "Content-Type: application/json" -d '{"username":"user1","password":"password123"}'
  ```

- **POST /auth/login** - Authenticate and return a token
  ```bash
  curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"username":"user1","password":"password123"}'
  ```

### Books
- **POST /books** - Add a new book (Authenticated users only)
  ```bash
  curl -X POST http://localhost:3000/books -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"title":"Book Title","author":"Author Name","genre":"Fiction","description":"Book description"}'
  ```

- **GET /books** - Get all books (with pagination and optional filters)
  ```bash
  curl http://localhost:3000/books?page=1&limit=10&author=Author&genre=Fiction
  ```

- **GET /books/:id** - Get book details by ID
  ```bash
  curl http://localhost:3000/books/1
  ```

- **GET /books/search** - Search books by title or author
  ```bash
  curl http://localhost:3000/books/search?title=Book&author=Author
  ```

### Reviews
- **GET /books/:bookId/reviews** - Get all reviews for a specific book
  ```bash
  curl http://localhost:3000/books/1/reviews?page=1&limit=10
  ```
  Response includes:
  - List of reviews with reviewer usernames
  - Average rating
  - Pagination information

- **GET /user/reviews** - Get all reviews by the authenticated user
  ```bash
  curl http://localhost:3000/user/reviews?page=1&limit=10 -H "Authorization: Bearer <token>"
  ```
  Response includes:
  - List of user's reviews with book details
  - Pagination information

- **POST /books/:bookId/reviews** - Submit a review (Authenticated users only)
  ```bash
  curl -X POST http://localhost:3000/books/1/reviews -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"rating":5,"comment":"Great book!"}'
  ```

- **PUT /reviews/:id** - Update your own review
  ```bash
  curl -X PUT http://localhost:3000/reviews/1 -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"rating":4,"comment":"Updated review"}'
  ```

- **DELETE /reviews/:id** - Delete your own review
  ```bash
  curl -X DELETE http://localhost:3000/reviews/1 -H "Authorization: Bearer <token>"
  ```

## Features
- JWT Authentication for secure user authentication
- MySQL Database for relational data storage
- Pagination for books and reviews to handle large datasets efficiently
- Search functionality for books by title and author
- One review per user per book
- Average rating calculation for books
- Detailed review information including timestamps
- User-specific review management

## Error Handling
The API returns appropriate HTTP status codes and error messages:
- 200: Success
- 201: Resource created
- 400: Bad request (e.g., duplicate review)
- 401: Unauthorized (invalid or missing token)
- 404: Resource not found
- 500: Server error

## Pagination
Most list endpoints support pagination through query parameters:
- `page`: The page number (default: 1)
- `limit`: Number of items per page (default: 10)

## Security
- Passwords are hashed using bcrypt
- JWT tokens expire after 1 hour
- Users can only modify their own reviews
- Input validation and sanitization
- SQL injection prevention through parameterized queries 