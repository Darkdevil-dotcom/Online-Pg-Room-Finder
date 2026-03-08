const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    deposit: { type: Number, default: 0, min: 0 },
    description: { type: String, trim: true, default: '' },
    location: {
      type: { type: String, enum: ['Point'], required: true, default: 'Point' },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (value) => Array.isArray(value) && value.length === 2,
          message: 'Location coordinates must be [lng, lat].'
        }
      }
    },
    address: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    facilities: { type: [String], default: [] },
    roomType: { type: String, enum: ['Single', 'Double', 'Triple'], required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Any'], default: 'Any' },
    foodType: { type: String, enum: ['Veg', 'Non-Veg', 'Both'], default: 'Both' },
    isAC: { type: Boolean, default: false },
    distanceToWorkOrCollegeKm: { type: Number, min: 0, default: 0 },
    images: [{ type: mongoose.Schema.Types.Mixed }],
    imageHashes: [{ type: String, index: true }],
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contactNumber: { type: String, required: true, trim: true },
    viewsCount: { type: Number, default: 0 },
    inquiriesCount: { type: Number, default: 0 },
    conversionsCount: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    flagged: { type: Boolean, default: false },
    flaggedReasons: { type: [String], default: [] }
  },
  { timestamps: true }
);

roomSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Room', roomSchema);
