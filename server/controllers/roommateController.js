const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const RoommateProfile = require('../models/RoommateProfile');
const { computeRoommateCompatibility } = require('../services/roommateMatchingService');

const normalizePayload = (payload = {}) => {
  const sleepTime = payload.sleepTime;
  const foodHabits = payload.foodHabits;
  const gender = payload.gender;
  const budgetMax = payload.budgetMax;
  const cleanliness = payload.cleanliness;

  return {
    sleepTime: Number(sleepTime),
    foodHabits: foodHabits ?? 'Any',
    gender: gender ?? 'Any',
    budgetMax: Number(budgetMax),
    cleanliness: Number(cleanliness)
  };
};

const validatePayload = (payload) => {
  if (!Number.isFinite(payload.sleepTime) || payload.sleepTime < 0 || payload.sleepTime > 23) {
    throw new ApiError(400, 'sleepTime must be an integer between 0 and 23');
  }
  if (!payload.foodHabits || !['Veg', 'Non-Veg', 'Any'].includes(payload.foodHabits)) {
    throw new ApiError(400, 'foodHabits must be one of Veg, Non-Veg, Any');
  }
  if (!payload.gender || !['Male', 'Female', 'Any'].includes(payload.gender)) {
    throw new ApiError(400, 'gender must be one of Male, Female, Any');
  }
  if (!Number.isFinite(payload.budgetMax) || payload.budgetMax < 0) {
    throw new ApiError(400, 'budgetMax must be a positive number');
  }
  if (!Number.isFinite(payload.cleanliness) || payload.cleanliness < 1 || payload.cleanliness > 5) {
    throw new ApiError(400, 'cleanliness must be a number between 1 and 5');
  }
};

const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await RoommateProfile.findOne({ tenantId: req.user.id }).lean();
  if (!profile) {
    throw new ApiError(404, 'Roommate profile not found. Create one first.');
  }

  res.json({ success: true, data: profile });
});

const upsertMyProfile = asyncHandler(async (req, res) => {
  const payload = normalizePayload(req.body || {});
  validatePayload(payload);

  const updated = await RoommateProfile.findOneAndUpdate(
    { tenantId: req.user.id },
    payload,
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  ).lean();

  res.json({ success: true, message: 'Roommate preferences saved', data: updated });
});

const findMatches = asyncHandler(async (req, res) => {
  const myProfile = await RoommateProfile.findOne({ tenantId: req.user.id }).lean();
  if (!myProfile) {
    throw new ApiError(400, 'Save your roommate profile first.');
  }

  const candidates = await RoommateProfile.find({ tenantId: { $ne: req.user.id } })
    .populate('tenantId', 'name email role')
    .lean();

  const matches = candidates
    .map((other) => {
      const { score } = computeRoommateCompatibility(myProfile, other);
      return {
        tenantId: other.tenantId?._id || other.tenantId,
        tenant: {
          name: other.tenantId?.name,
          email: other.tenantId?.email,
          role: other.tenantId?.role
        },
        profile: {
          sleepTime: other.sleepTime,
          foodHabits: other.foodHabits,
          gender: other.gender,
          budgetMax: other.budgetMax,
          cleanliness: other.cleanliness
        },
        score
      };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 25);

  // Also return your own profile so the UI can render context if needed.
  res.json({
    success: true,
    data: {
      myProfile: myProfile,
      matches
    }
  });
});

module.exports = {
  getMyProfile,
  upsertMyProfile,
  findMatches
};

