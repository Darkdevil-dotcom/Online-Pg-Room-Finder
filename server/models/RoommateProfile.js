const mongoose = require('mongoose');

const roommateProfileSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    // Preferred bedtime hour (0-23). Used for sleep compatibility.
    sleepTime: { type: Number, required: true, min: 0, max: 23 },
    // Tenant's food preference (for shared living compatibility).
    foodHabits: { type: String, enum: ['Veg', 'Non-Veg', 'Any'], default: 'Any' },
    // Tenant's gender (for roommate gender compatibility).
    gender: { type: String, enum: ['Male', 'Female', 'Any'], default: 'Any' },
    // Tenant's maximum monthly budget they can comfortably spend.
    budgetMax: { type: Number, required: true, min: 0 },
    // Cleanliness preference (1=very low maintenance, 5=very clean).
    cleanliness: { type: Number, required: true, min: 1, max: 5 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('RoommateProfile', roommateProfileSchema);

