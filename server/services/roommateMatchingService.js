const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

const scoreSleep = (a, b) => {
  const at = Number(a?.sleepTime);
  const bt = Number(b?.sleepTime);
  if (!Number.isFinite(at) || !Number.isFinite(bt)) return 0.5;

  // 0..23 => max difference 23. Normalize with a gentle scale.
  const diff = Math.abs(at - bt);
  const normalized = 1 - diff / 23;
  return clamp(normalized, 0, 1);
};

const scoreFood = (a, b) => {
  const af = a?.foodHabits;
  const bf = b?.foodHabits;
  if (!af || !bf) return 0.6;
  if (af === 'Any' || bf === 'Any') return 1;
  return af === bf ? 1 : 0.2;
};

const scoreGender = (a, b) => {
  const ag = a?.gender;
  const bg = b?.gender;
  if (!ag || !bg) return 0.6;
  if (ag === 'Any' || bg === 'Any') return 0.85;
  return ag === bg ? 1 : 0.35;
};

const scoreBudget = (a, b) => {
  const ab = Number(a?.budgetMax);
  const bb = Number(b?.budgetMax);
  if (!Number.isFinite(ab) || !Number.isFinite(bb) || ab <= 0 || bb <= 0) return 0.5;

  // Budget compatibility is based on how close their comfort budgets are.
  // This keeps matches stable even without room price.
  const maxBudget = Math.max(ab, bb);
  if (!maxBudget) return 0.5;
  const diff = Math.abs(ab - bb);
  const normalized = 1 - diff / maxBudget;
  return clamp(normalized, 0, 1);
};

const scoreCleanliness = (a, b) => {
  const ac = Number(a?.cleanliness);
  const bc = Number(b?.cleanliness);
  if (!Number.isFinite(ac) || !Number.isFinite(bc)) return 0.5;

  const diff = Math.abs(ac - bc); // 0..4
  const normalized = 1 - diff / 4;
  return clamp(normalized, 0, 1);
};

/**
 * Compatibility score between two roommate profiles.
 * Returns integer score in range 0..100.
 */
const computeRoommateCompatibility = (profileA, profileB) => {
  const weights = {
    sleep: 0.25,
    food: 0.2,
    gender: 0.2,
    budget: 0.2,
    cleanliness: 0.15
  };

  const factors = {
    sleep: scoreSleep(profileA, profileB),
    food: scoreFood(profileA, profileB),
    gender: scoreGender(profileA, profileB),
    budget: scoreBudget(profileA, profileB),
    cleanliness: scoreCleanliness(profileA, profileB)
  };

  const raw = Object.entries(weights).reduce((sum, [k, w]) => sum + (factors[k] || 0) * w, 0);
  const score = Math.round(clamp(raw, 0, 1) * 100);

  return { score, factors };
};

module.exports = {
  computeRoommateCompatibility
};

