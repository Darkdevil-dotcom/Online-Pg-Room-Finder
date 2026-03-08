const crypto = require('crypto');
const Room = require('../models/Room');

const toImageHash = (value) => {
  const source = typeof value === 'string' ? value : value?.url || '';
  if (!source) return null;
  return crypto.createHash('sha256').update(source).digest('hex');
};

const detectFraudSignals = async ({ roomId = null, contactNumber, title, address, imageHashes = [] }) => {
  const reasons = [];

  if (contactNumber) {
    const duplicatePhone = await Room.findOne({
      contactNumber,
      ...(roomId ? { _id: { $ne: roomId } } : {})
    }).select('_id');

    if (duplicatePhone) reasons.push('duplicate_phone_number');
  }

  if (title && address) {
    const similarListing = await Room.findOne({
      title: { $regex: `^${title}$`, $options: 'i' },
      address: { $regex: `^${address}$`, $options: 'i' },
      ...(roomId ? { _id: { $ne: roomId } } : {})
    }).select('_id');

    if (similarListing) reasons.push('suspicious_repeated_listing');
  }

  if (imageHashes.length) {
    const reusedImages = await Room.findOne({
      imageHashes: { $in: imageHashes },
      ...(roomId ? { _id: { $ne: roomId } } : {})
    }).select('_id');

    if (reusedImages) reasons.push('reused_images');
  }

  return {
    flagged: reasons.length > 0,
    reasons
  };
};

module.exports = {
  toImageHash,
  detectFraudSignals
};
