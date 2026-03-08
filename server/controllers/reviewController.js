const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Review = require('../models/Review');
const Room = require('../models/Room');

const recalculateRoomRating = async (roomId) => {
  const [stats] = await Review.aggregate([
    { $match: { roomId: new mongoose.Types.ObjectId(roomId) } },
    {
      $group: {
        _id: '$roomId',
        averageRating: { $avg: '$rating' },
        ratingsCount: { $sum: 1 }
      }
    }
  ]);

  await Room.findByIdAndUpdate(roomId, {
    averageRating: Number((stats?.averageRating || 0).toFixed(2)),
    ratingsCount: stats?.ratingsCount || 0
  });
};

const addReview = asyncHandler(async (req, res) => {
  const { roomId, rating, review } = req.body;

  if (!roomId || !rating) {
    throw new ApiError(400, 'roomId and rating are required');
  }

  const room = await Room.findById(roomId).select('ownerId');
  if (!room) throw new ApiError(404, 'Room not found');

  const exists = await Review.findOne({ roomId, tenantId: req.user.id });
  if (exists) {
    throw new ApiError(409, 'You already reviewed this listing');
  }

  const created = await Review.create({
    roomId,
    tenantId: req.user.id,
    ownerId: room.ownerId,
    rating,
    review: review || ''
  });

  await recalculateRoomRating(roomId);

  res.status(201).json({
    success: true,
    message: 'Review added',
    data: created
  });
});

const getReviews = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const reviews = await Review.find({ roomId })
    .populate('tenantId', 'name')
    .populate('ownerReply.repliedBy', 'name')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: reviews
  });
});

const replyToReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { message } = req.body;

  if (!message) throw new ApiError(400, 'Reply message is required');

  const review = await Review.findById(reviewId).populate('roomId', 'ownerId');
  if (!review) throw new ApiError(404, 'Review not found');

  if (review.roomId.ownerId.toString() !== req.user.id.toString()) {
    throw new ApiError(403, 'Only listing owner can reply');
  }

  review.ownerReply = {
    message,
    repliedAt: new Date(),
    repliedBy: req.user.id
  };

  await review.save();

  res.json({
    success: true,
    message: 'Reply sent',
    data: review
  });
});

module.exports = {
  addReview,
  getReviews,
  replyToReview,
  recalculateRoomRating
};
