const express = require('express');
const { listFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', listFavorites);
router.post('/:roomId', addFavorite);
router.delete('/:roomId', removeFavorite);

module.exports = router;
