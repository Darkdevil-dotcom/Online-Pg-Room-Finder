const express = require('express');
const { recommendRoom, chat } = require('../controllers/aiController');

const router = express.Router();

router.post('/recommend-room', recommendRoom);
router.post('/chat', chat);

module.exports = router;
