const express = require('express');
const {
  createRoom,
  updateRoom,
  deleteRoom,
  getPublicRoomById,
  getRoomById,
  listRooms,
  getNearbyRooms,
  compareRooms
} = require('../controllers/roomController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const { uploadRoomImages, processUploadedImages } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', listRooms);
router.get('/nearby', getNearbyRooms);
router.get('/compare', compareRooms);
router.get('/:id/full', protect, getRoomById);
router.get('/:id', getPublicRoomById);

router.post('/', protect, allowRoles('owner'), uploadRoomImages, processUploadedImages, createRoom);
router.put('/:id', protect, allowRoles('owner'), uploadRoomImages, processUploadedImages, updateRoom);
router.delete('/:id', protect, allowRoles('owner'), deleteRoom);

module.exports = router;
