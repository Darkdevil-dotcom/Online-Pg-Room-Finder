const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const parseArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
};

const buildRoomMatchFromQuery = (query = {}) => {
  const match = {};

  const minPrice = parseNumber(query.minPrice);
  const maxPrice = parseNumber(query.maxPrice);
  if (minPrice !== undefined || maxPrice !== undefined) {
    match.price = {};
    if (minPrice !== undefined) match.price.$gte = minPrice;
    if (maxPrice !== undefined) match.price.$lte = maxPrice;
  }

  if (query.gender) {
    match.gender = query.gender;
  }

  if (query.roomType) {
    match.roomType = query.roomType;
  }

  const facilities = parseArray(query.facilities);
  if (facilities.length) {
    match.facilities = { $all: facilities };
  }

  return match;
};

module.exports = {
  parseNumber,
  parseArray,
  buildRoomMatchFromQuery
};
