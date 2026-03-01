const User = require('../models/User');
const Room = require('../models/Room');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const listFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'favorites',
    select: 'title price deposit address facilities roomType gender images location'
  });

  res.json({
    success: true,
    data: user.favorites || []
  });
});

const addFavorite = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  await User.findByIdAndUpdate(req.user.id, { $addToSet: { favorites: roomId } }, { new: true });

  res.json({
    success: true,
    message: 'Room added to favorites'
  });
});

const removeFavorite = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  await User.findByIdAndUpdate(req.user.id, { $pull: { favorites: roomId } }, { new: true });

  res.json({
    success: true,
    message: 'Room removed from favorites'
  });
});

module.exports = {
  listFavorites,
  addFavorite,
  removeFavorite
};
