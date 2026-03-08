const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, trim: true, maxlength: 1000, required: true },
    ownerReply: {
      message: { type: String, trim: true, maxlength: 1000, default: '' },
      repliedAt: Date
    },
    status: { type: String, enum: ['open', 'replied', 'closed'], default: 'open' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
