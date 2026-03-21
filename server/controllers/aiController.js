const Room = require('../models/Room');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parseArray, parseNumber } = require('../utils/queryHelpers');
const { recommendRoomsWithAI } = require('../services/aiService');
const { processChatMessage: processOllamaChat } = require('../services/ollamaChatService');
const jwt = require('jsonwebtoken');

const buildMatchFromPreferences = (preferences) => {
  const match = {};
  if (preferences.minBudget != null || preferences.maxBudget != null) {
    match.price = {};
    if (preferences.minBudget != null) match.price.$gte = preferences.minBudget;
    if (preferences.maxBudget != null) match.price.$lte = preferences.maxBudget;
  }
  if (preferences.gender) match.gender = preferences.gender;
  if (preferences.roomType) match.roomType = preferences.roomType;
  if (Array.isArray(preferences.facilities) && preferences.facilities.length) {
    match.facilities = { $all: preferences.facilities };
  }
  return match;
};

const fetchRoomsForPreferences = async (preferences) => {
  const match = buildMatchFromPreferences(preferences);
  const lat = preferences.lat != null ? preferences.lat : undefined;
  const lng = preferences.lng != null ? preferences.lng : undefined;
  const maxDistanceKm = preferences.maxDistanceKm || 10;

  if (lat != null && lng != null) {
    const maxDistance = maxDistanceKm * 1000;
    return Room.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distanceMeters',
          maxDistance,
          spherical: true,
          query: match
        }
      },
      {
        $addFields: {
          distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 2] }
        }
      },
      { $limit: 20 }
    ]);
  }
  return Room.find(match).limit(20).lean();
};

const recommendRoom = asyncHandler(async (req, res) => {
  const preferences = {
    minBudget: parseNumber(req.body.minBudget),
    maxBudget: parseNumber(req.body.maxBudget),
    gender: req.body.gender,
    roomType: req.body.roomType,
    facilities: parseArray(req.body.facilities),
    maxDistanceKm: parseNumber(req.body.maxDistanceKm),
    lat: parseNumber(req.body.lat),
    lng: parseNumber(req.body.lng)
  };

  const match = {};
  if (preferences.minBudget !== undefined || preferences.maxBudget !== undefined) {
    match.price = {};
    if (preferences.minBudget !== undefined) match.price.$gte = preferences.minBudget;
    if (preferences.maxBudget !== undefined) match.price.$lte = preferences.maxBudget;
  }
  if (preferences.gender) match.gender = preferences.gender;
  if (preferences.roomType) match.roomType = preferences.roomType;
  if (preferences.facilities.length) match.facilities = { $all: preferences.facilities };

  let rooms = [];

  if (preferences.lat !== undefined && preferences.lng !== undefined) {
    const maxDistance = (preferences.maxDistanceKm || 10) * 1000;
    rooms = await Room.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [preferences.lng, preferences.lat] },
          distanceField: 'distanceMeters',
          maxDistance,
          spherical: true,
          query: match
        }
      },
      {
        $addFields: {
          distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 2] }
        }
      },
      { $limit: 20 }
    ]);
  } else {
    rooms = await Room.find(match).limit(20).lean();
  }

  if (!rooms.length) {
    throw new ApiError(404, 'No rooms found for given preferences');
  }

  const aiResult = await recommendRoomsWithAI(preferences, rooms);

  res.json({
    success: true,
    data: {
      source: aiResult.source,
      summary: aiResult.summary,
      recommendations: aiResult.recommendations,
      matchedCount: rooms.length
    }
  });
});

const chat = asyncHandler(async (req, res) => {
  const sessionId = req.body.sessionId || req.headers['x-session-id'];
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  const lat = parseNumber(req.body.lat);
  const lng = parseNumber(req.body.lng);
  const history = Array.isArray(req.body.history) ? req.body.history : [];

  // Optional auth: chatbot must work without login.
  let isAuthenticated = false;
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      isAuthenticated = Boolean(payload?.sub);
    }
  } catch (_err) {
    isAuthenticated = false;
  }

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'message is required'
    });
  }

  let result;
  try {
    result = await processOllamaChat(sessionId, message, lat, lng, { history, isAuthenticated });
  } catch (error) {
    console.error('[aiController.chat] failed:', error?.message || error);
    return res.status(500).json({ success: false, message: 'AI chat failed' });
  }

  if (result.type === 'recommendations') {
    return res.json({
      success: true,
      data: {
        type: 'recommendations',
        message: result.message,
        recommendations: result.recommendedRooms
      }
    });
  }

  res.json({
    success: true,
    data: {
      type: 'follow_up',
      text: result.text,
    }
  });
});

module.exports = {
  recommendRoom,
  chat
};
