const mongoose = require('mongoose');

const roomViewSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    viewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    viewedAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: false }
);

module.exports = mongoose.model('RoomView', roomViewSchema);
