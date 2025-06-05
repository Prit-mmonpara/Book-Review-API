const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all reviews for a book
router.get('/books/:bookId/reviews', reviewController.getBookReviews);

// Get all reviews by the authenticated user
router.get('/user/reviews', authMiddleware, reviewController.getUserReviews);

// Add a review to a book
router.post('/books/:bookId/reviews', authMiddleware, reviewController.addReview);

// Update a review
router.put('/reviews/:id', authMiddleware, reviewController.updateReview);

// Delete a review
router.delete('/reviews/:id', authMiddleware, reviewController.deleteReview);

module.exports = router; 