const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, trim: true, maxlength: 1000, default: '' },
    ownerReply: {
      message: { type: String, trim: true, maxlength: 1000, default: '' },
      repliedAt: Date,
      repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  },
  { timestamps: true }
);

reviewSchema.index({ roomId: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
