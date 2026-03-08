const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Inquiry = require('../models/Inquiry');
const Room = require('../models/Room');
const { createAndEmitNotification } = require('../services/notificationService');

const createInquiry = asyncHandler(async (req, res) => {
  const { roomId, message } = req.body;
  if (!roomId || !message) {
    throw new ApiError(400, 'roomId and message are required');
  }

  const room = await Room.findById(roomId).select('ownerId title inquiriesCount');
  if (!room) throw new ApiError(404, 'Room not found');

  const inquiry = await Inquiry.create({
    roomId,
    tenantId: req.user.id,
    ownerId: room.ownerId,
    message
  });

  await Room.findByIdAndUpdate(roomId, { $inc: { inquiriesCount: 1 } });

  await createAndEmitNotification({
    io: req.app.get('io'),
    userId: room.ownerId,
    type: 'inquiry_created',
    title: 'New inquiry received',
    message: `New inquiry for ${room.title}`,
    payload: {
      inquiryId: inquiry._id,
      roomId
    }
  });

  res.status(201).json({
    success: true,
    message: 'Inquiry sent',
    data: inquiry
  });
});

const replyToInquiry = asyncHandler(async (req, res) => {
  const { inquiryId } = req.params;
  const { message, markConverted } = req.body;

  if (!message) throw new ApiError(400, 'Reply message is required');

  const inquiry = await Inquiry.findById(inquiryId);
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');

  if (inquiry.ownerId.toString() !== req.user.id.toString()) {
    throw new ApiError(403, 'Only listing owner can reply');
  }

  inquiry.ownerReply = {
    message,
    repliedAt: new Date()
  };
  inquiry.status = 'replied';
  await inquiry.save();

  if (markConverted) {
    await Room.findByIdAndUpdate(inquiry.roomId, { $inc: { conversionsCount: 1 } });
  }

  await createAndEmitNotification({
    io: req.app.get('io'),
    userId: inquiry.tenantId,
    type: 'inquiry_reply',
    title: 'Owner replied to your inquiry',
    message,
    payload: {
      inquiryId: inquiry._id,
      roomId: inquiry.roomId
    }
  });

  res.json({
    success: true,
    message: 'Reply sent',
    data: inquiry
  });
});

const getMyInquiries = asyncHandler(async (req, res) => {
  const match = req.user.role === 'owner' ? { ownerId: req.user.id } : { tenantId: req.user.id };

  const inquiries = await Inquiry.find(match)
    .populate('roomId', 'title')
    .populate('tenantId', 'name')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: inquiries
  });
});

module.exports = {
  createInquiry,
  replyToInquiry,
  getMyInquiries
};
