const express = require('express');
const { addReview, getReviews, replyToReview } = require('../controllers/reviewController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, allowRoles('tenant', 'user'), addReview);
router.get('/:roomId', getReviews);
router.patch('/:reviewId/reply', protect, allowRoles('owner', 'admin'), replyToReview);

module.exports = router;
