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
    images: [{ type: mongoose.Schema.Types.Mixed }],
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contactNumber: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

roomSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Room', roomSchema);
