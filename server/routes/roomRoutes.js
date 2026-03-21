const express = require('express');
const {
  createRoom,
  updateRoom,
  deleteRoom,
  getPublicRoomById,
  getRoomById,
  listRooms,
  getNearbyRooms,
  compareRooms,
  getRoomsForUser
} = require('../controllers/roomController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const { uploadRoomImages, processUploadedImages } = require('../middleware/uploadMiddleware');
const { trackRoomView } = require('../middleware/trackViewMiddleware');

const router = express.Router();

router.get('/', listRooms);
router.get('/nearby', getNearbyRooms);
router.get('/compare', compareRooms);
router.get('/user', protect, allowRoles('owner'), getRoomsForUser);
router.get('/:id/full', protect, trackRoomView, getRoomById);
router.get('/:id', trackRoomView, getPublicRoomById);

router.post('/', protect, allowRoles('owner'), uploadRoomImages, processUploadedImages, createRoom);
router.put('/:id', protect, allowRoles('owner'), uploadRoomImages, processUploadedImages, updateRoom);
router.delete('/:id', protect, allowRoles('owner'), deleteRoom);

module.exports = router;
