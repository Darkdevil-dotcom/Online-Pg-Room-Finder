const mongoose = require('mongoose');

const tenantPreferenceSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    budget: {
      min: { type: Number, min: 0, default: 0 },
      max: { type: Number, min: 0, default: 0 }
    },
    preferredLocation: {
      city: { type: String, trim: true, default: '' },
      area: { type: String, trim: true, default: '' }
    },
    acPreference: { type: String, enum: ['AC', 'Non-AC', 'Any'], default: 'Any' },
    foodType: { type: String, enum: ['Veg', 'Non-Veg', 'Any'], default: 'Any' },
    maxDistanceKm: { type: Number, min: 0, default: 0 },
    weights: {
      budget: { type: Number, min: 0, default: 0.35 },
      location: { type: Number, min: 0, default: 0.25 },
      ac: { type: Number, min: 0, default: 0.15 },
      food: { type: Number, min: 0, default: 0.1 },
      distance: { type: Number, min: 0, default: 0.15 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TenantPreference', tenantPreferenceSchema);
