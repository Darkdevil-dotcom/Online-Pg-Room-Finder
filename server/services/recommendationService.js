const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

const normalizeWeights = (weights = {}) => {
  const fallback = {
    budget: 0.35,
    location: 0.25,
    ac: 0.15,
    food: 0.1,
    distance: 0.15
  };
  const merged = { ...fallback, ...weights };
  const total = Object.values(merged).reduce((sum, num) => sum + (Number(num) || 0), 0) || 1;
  return Object.fromEntries(Object.entries(merged).map(([key, val]) => [key, (Number(val) || 0) / total]));
};

const scoreBudget = (pref, room) => {
  const min = Number(pref?.budget?.min || 0);
  const max = Number(pref?.budget?.max || 0);
  const target = min && max ? (min + max) / 2 : min || max || room.price;
  if (!target) return 1;
  return clamp(1 - Math.abs((room.price || 0) - target) / target);
};

const scoreLocation = (pref, room) => {
  const preferredCity = (pref?.preferredLocation?.city || '').toLowerCase().trim();
  const preferredArea = (pref?.preferredLocation?.area || '').toLowerCase().trim();
  const address = (room.address || '').toLowerCase();

  if (!preferredCity && !preferredArea) return 1;
  if (preferredCity && preferredArea && address.includes(preferredCity) && address.includes(preferredArea)) return 1;
  if (preferredCity && address.includes(preferredCity)) return 0.75;
  if (preferredArea && address.includes(preferredArea)) return 0.65;
  return 0.3;
};

const scoreAc = (pref, room) => {
  if (pref?.acPreference === 'Any') return 1;
  if (pref?.acPreference === 'AC') return room.isAC ? 1 : 0;
  if (pref?.acPreference === 'Non-AC') return room.isAC ? 0 : 1;
  return 1;
};

const scoreFood = (pref, room) => {
  if (pref?.foodType === 'Any') return 1;
  if (!room.foodType || room.foodType === 'Both') return 1;
  return room.foodType === pref.foodType ? 1 : 0;
};

const scoreDistance = (pref, room) => {
  const maxDistance = Number(pref?.maxDistanceKm || 0);
  const roomDistance = Number(room.distanceToWorkOrCollegeKm || 0);
  if (!maxDistance) return 1;
  return clamp(1 - roomDistance / maxDistance);
};

const computeRecommendationScore = (preference, room) => {
  const weights = normalizeWeights(preference?.weights);
  const factors = {
    budget: scoreBudget(preference, room),
    location: scoreLocation(preference, room),
    ac: scoreAc(preference, room),
    food: scoreFood(preference, room),
    distance: scoreDistance(preference, room)
  };

  const score = Object.entries(weights).reduce((sum, [key, weight]) => sum + (factors[key] || 0) * weight, 0);

  return {
    score: Number((score * 100).toFixed(2)),
    explanation: {
      weights,
      factors,
      summary: `Budget ${(factors.budget * 100).toFixed(0)}%, location ${(factors.location * 100).toFixed(0)}%, AC ${(factors.ac * 100).toFixed(0)}%, food ${(factors.food * 100).toFixed(0)}%, distance ${(factors.distance * 100).toFixed(0)}%`
    }
  };
};

module.exports = {
  computeRecommendationScore
};
