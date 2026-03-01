const ApiError = require('../utils/ApiError');

const normalizeCoordinates = (lat, lng) => {
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) return null;
  return {
    type: 'Point',
    coordinates: [parsedLng, parsedLat]
  };
};

const geocodeAddress = async ({ address, pincode }) => {
  const query = [address, pincode].filter(Boolean).join(', ').trim();
  if (!query) {
    throw new ApiError(400, 'address and pincode are required');
  }

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'StayNear/1.0 (room-finder)'
      }
    });

    if (!response.ok) {
      throw new Error(`geocode status ${response.status}`);
    }

    const results = await response.json();
    const first = Array.isArray(results) ? results[0] : null;
    const coords = first ? normalizeCoordinates(first.lat, first.lon) : null;
    if (!coords) {
      throw new ApiError(400, 'Could not geocode address and pincode. Please verify the address.');
    }
    return coords;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, 'Could not geocode address and pincode. Please verify the address.');
  }
};

module.exports = {
  geocodeAddress,
  normalizeCoordinates
};
