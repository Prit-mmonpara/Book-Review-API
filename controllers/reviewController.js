const db = require('../models/db');

exports.getBookReviews = async (req, res) => {
  const { bookId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // Get reviews with user information
    const query = `
      SELECT r.*, u.username 
      FROM reviews r 
      JOIN users_db u ON r.user_id = u.id 
      WHERE r.book_id = ? 
      ORDER BY r.created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const [reviews] = await db.query(query, [bookId, parseInt(limit), offset]);

    // Get total count for pagination
    const countQuery = 'SELECT COUNT(*) as total FROM reviews WHERE book_id = ?';
    const [countResult] = await db.query(countQuery, [bookId]);
    const total = countResult[0].total;

    // Calculate average rating
    const avgQuery = 'SELECT AVG(rating) as average FROM reviews WHERE book_id = ?';
    const [avgResult] = await db.query(avgQuery, [bookId]);
    const averageRating = avgResult[0].average || 0;

    res.json({
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      averageRating: parseFloat(averageRating)
    });
  } catch (error) {
    console.error('Get book reviews error:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

exports.getUserReviews = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const userId = req.user.id; // from auth middleware

  try {
    // Get reviews with book information
    const query = `
      SELECT r.*, b.title as book_title, b.author as book_author 
      FROM reviews r 
      JOIN books b ON r.book_id = b.id 
      WHERE r.user_id = ? 
      ORDER BY r.created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const [reviews] = await db.query(query, [userId, parseInt(limit), offset]);

    // Get total count for pagination
    const countQuery = 'SELECT COUNT(*) as total FROM reviews WHERE user_id = ?';
    const [countResult] = await db.query(countQuery, [userId]);
    const total = countResult[0].total;

    res.json({
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

exports.addReview = async (req, res) => {
  const { bookId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id; // from auth middleware

  try {
    // Check if user already reviewed this book
    const checkQuery = 'SELECT * FROM reviews WHERE user_id = ? AND book_id = ?';
    const [existingReviews] = await db.query(checkQuery, [userId, bookId]);
    
    if (existingReviews.length > 0) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    const insertQuery = 'INSERT INTO reviews (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(insertQuery, [userId, bookId, rating, comment]);
    
    res.status(201).json({ 
      message: 'Review added successfully', 
      reviewId: result.insertId 
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Error adding review' });
  }
};

exports.updateReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  try {
    const query = 'UPDATE reviews SET rating = ?, comment = ? WHERE id = ? AND user_id = ?';
    const [result] = await db.query(query, [rating, comment, id, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }
    
    res.json({ message: 'Review updated successfully' });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Error updating review' });
  }
};

exports.deleteReview = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const query = 'DELETE FROM reviews WHERE id = ? AND user_id = ?';
    const [result] = await db.query(query, [id, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
}; 