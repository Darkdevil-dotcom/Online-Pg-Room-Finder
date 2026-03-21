const express = require('express');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const { getMyProfile, upsertMyProfile, findMatches } = require('../controllers/roommateController');

const router = express.Router();

router.get('/me', protect, allowRoles('tenant', 'user'), getMyProfile);
router.put('/me', protect, allowRoles('tenant', 'user'), upsertMyProfile);
router.get('/matches', protect, allowRoles('tenant', 'user'), findMatches);

module.exports = router;

