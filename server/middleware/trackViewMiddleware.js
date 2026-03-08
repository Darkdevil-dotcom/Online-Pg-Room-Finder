const Room = require('../models/Room');
const RoomView = require('../models/RoomView');
const asyncHandler = require('../utils/asyncHandler');

const trackRoomView = asyncHandler(async (req, res, next) => {
  const roomId = req.params.id;

  if (!roomId) return next();

  const room = await Room.findById(roomId).select('_id');
  if (room) {
    await Promise.all([
      Room.findByIdAndUpdate(roomId, { $inc: { viewsCount: 1 } }),
      RoomView.create({ roomId, viewerId: req.user?._id || null, viewedAt: new Date() })
    ]);
  }

  next();
});

module.exports = {
  trackRoomView
};
