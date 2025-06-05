const db = require('../models/db');

exports.addBook = async (req, res) => {
  const { title, author, genre, description } = req.body;
  try {
    const query = 'INSERT INTO books (title, author, genre, description) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(query, [title, author, genre, description]);
    res.status(201).json({ message: 'Book added successfully', bookId: result.insertId });
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({ message: 'Error adding book' });
  }
};

exports.getAllBooks = async (req, res) => {
  const { page = 1, limit = 10, author, genre } = req.query;
  const offset = (page - 1) * limit;
  try {
    let query = 'SELECT * FROM books';
    const params = [];
    if (author) {
      query += ' WHERE author LIKE ?';
      params.push(`%${author}%`);
    }
    if (genre) {
      query += author ? ' AND genre LIKE ?' : ' WHERE genre LIKE ?';
      params.push(`%${genre}%`);
    }
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const [books] = await db.query(query, params);
    res.json(books);
  } catch (error) {
    console.error('Get all books error:', error);
    res.status(500).json({ message: 'Error fetching books' });
  }
};

exports.getBookById = async (req, res) => {
  const { id } = req.params;
  try {
    const bookQuery = 'SELECT * FROM books WHERE id = ?';
    const [books] = await db.query(bookQuery, [id]);
    
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const reviewQuery = 'SELECT r.*, u.username FROM reviews r JOIN users_db u ON r.user_id = u.id WHERE r.book_id = ?';
    const [reviews] = await db.query(reviewQuery, [id]);
    
    const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length || 0;
    res.json({ ...books[0], reviews, averageRating: avgRating });
  } catch (error) {
    console.error('Get book by id error:', error);
    res.status(500).json({ message: 'Error fetching book' });
  }
};

exports.searchBooks = async (req, res) => {
  const { title, author } = req.query;
  try {
    let searchQuery = 'SELECT * FROM books';
    const params = [];

    if (title || author) {
      searchQuery += ' WHERE';
      if (title) {
        searchQuery += ' title LIKE ?';
        params.push(`%${title}%`);
      }
      if (author) {
        searchQuery += title ? ' OR author LIKE ?' : ' author LIKE ?';
        params.push(`%${author}%`);
      }
    }

    const [books] = await db.query(searchQuery, params);
    
    if (books.length === 0) {
      return res.status(404).json({ 
        message: 'No books found matching your search criteria',
        searchParams: { title, author }
      });
    }
    
    res.json(books);
  } catch (error) {
    console.error('Search books error:', error);
    res.status(500).json({ message: 'Error searching books' });
  }
}; 