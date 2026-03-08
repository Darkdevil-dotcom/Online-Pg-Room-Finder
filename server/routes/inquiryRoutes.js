const express = require('express');
const { createInquiry, replyToInquiry, getMyInquiries } = require('../controllers/inquiryController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, allowRoles('tenant', 'user'), createInquiry);
router.get('/me', protect, allowRoles('tenant', 'user', 'owner', 'admin'), getMyInquiries);
router.patch('/:inquiryId/reply', protect, allowRoles('owner', 'admin'), replyToInquiry);

module.exports = router;
