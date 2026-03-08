const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const TenantPreference = require('../models/TenantPreference');
const Room = require('../models/Room');
const { computeRecommendationScore } = require('../services/recommendationService');

const savePreferences = asyncHandler(async (req, res) => {
  const payload = req.body || {};

  if (payload.weights) {
    const total = Object.values(payload.weights).reduce((sum, value) => sum + Number(value || 0), 0);
    if (total <= 0) {
      throw new ApiError(400, 'Weights must have a positive total');
    }
  }

  const doc = await TenantPreference.findOneAndUpdate(
    { tenantId: req.user.id },
    {
      tenantId: req.user.id,
      budget: payload.budget,
      preferredLocation: payload.preferredLocation,
      acPreference: payload.acPreference,
      foodType: payload.foodType,
      maxDistanceKm: payload.maxDistanceKm,
      weights: payload.weights
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  res.json({
    success: true,
    message: 'Preferences saved',
    data: doc
  });
});

const getRecommendations = asyncHandler(async (req, res) => {
  const preference = await TenantPreference.findOne({ tenantId: req.user.id });

  if (!preference) {
    throw new ApiError(404, 'Preference profile not found. Save preferences first.');
  }

  const rooms = await Room.find({ flagged: false })
    .populate('ownerId', 'name email')
    .lean();

  const ranked = rooms
    .map((room) => {
      const match = computeRecommendationScore(preference, room);
      return {
        ...room,
        matchScore: match.score,
        matchExplanation: match.explanation
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  res.json({
    success: true,
    data: ranked
  });
});

module.exports = {
  savePreferences,
  getRecommendations
};
