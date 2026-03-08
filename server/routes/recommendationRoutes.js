const express = require('express');
const { savePreferences, getRecommendations } = require('../controllers/recommendationController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/preferences', protect, allowRoles('tenant', 'user'), savePreferences);
router.get('/', protect, allowRoles('tenant', 'user'), getRecommendations);

module.exports = router;
