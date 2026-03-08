const express = require('express');
const { getOwnerAnalytics } = require('../controllers/analyticsController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/owner', protect, allowRoles('owner', 'admin'), getOwnerAnalytics);

module.exports = router;
