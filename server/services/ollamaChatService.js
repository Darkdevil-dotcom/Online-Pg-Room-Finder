/**
 * StayNear conversational recommendation assistant (Ollama / local LLM).
 * No paid APIs. Uses aiService.generate() -> http://localhost:11434/api/generate (phi3).
 */

const Room = require('../models/Room');
const aiService = require('./aiService');

// In-memory session store: sessionId -> { preferences, lastAssistantText? }
const sessionStore = new Map();

const DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946 };
const getImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (typeof img === 'object' && typeof img.url === 'string') return img.url;
  return null;
};

function getOrCreateSession(sessionId) {
  if (!sessionId) return null;
  let session = sessionStore.get(sessionId);
  if (!session) {
    session = { preferences: {}, createdAt: Date.now(), lastAssistantText: '' };
    sessionStore.set(sessionId, session);
  }
  return session;
}

function extractPreferencesFromMessage(message, currentPrefs = {}) {
  const text = (message || '').trim().toLowerCase();
  const updated = { ...currentPrefs };

  const budgetMatch = text.match(/(?:under|max|upto|below|rs)?\s*(\d+)\s*k?/i) || text.match(/(\d{4,6})\s*(?:per\s*month|pm|\/mo)?/i);
  if (budgetMatch) {
    let num = parseInt(budgetMatch[1], 10);
    if (text.includes('k') && num < 1000) num *= 1000;
    if (num > 0 && num < 500000) updated.budget = num;
  }

  if (/\b(male|boy|men)\b/i.test(text)) updated.gender = 'Male';
  else if (/\b(female|girl|women)\b/i.test(text)) updated.gender = 'Female';
  else if (/\bany\b/i.test(text)) updated.gender = 'Any';

  if (/\b(food|meal|meals|breakfast|tiffin|mess)\b/i.test(text)) updated.food = true;
  if (/\b(ac|a\/c|air\s*condition)\b/i.test(text)) updated.ac = true;

  const distMatch = text.match(/(?:within|under|max)\s*(\d+)\s*km/i) || text.match(/(\d+)\s*km/i);
  if (distMatch) updated.distance = Math.min(parseInt(distMatch[1], 10) || 10, 50);
  else if (/\b(near|close|walking)\b/i.test(text) && updated.distance == null) updated.distance = 5;

  if (/\b(single|1\s*bhk|one)\b/i.test(text)) updated.roomType = 'Single';
  else if (/\b(double|twin|2\s*bed|sharing)\b/i.test(text)) updated.roomType = 'Double';
  else if (/\b(triple|3\s*bed)\b/i.test(text)) updated.roomType = 'Triple';

  return updated;
}

function getNextMissingQuestion(preferences) {
  if (preferences.budget == null) {
    return {
      text: "Hi! I'm StayNear AI, your student housing advisor. What's your maximum budget per month (in Rs)?",
      suggestedQuestions: ['Under Rs 10,000', 'Under Rs 15,000', 'Under Rs 20,000']
    };
  }
  if (preferences.gender == null) {
    return {
      text: 'Got it. Preferred gender for the PG?',
      suggestedQuestions: ['Male', 'Female', 'Any']
    };
  }
  if (preferences.roomType == null) {
    return {
      text: 'What type of room do you prefer?',
      suggestedQuestions: ['Single', 'Double', 'Triple']
    };
  }
  if (preferences.food == null && preferences.ac == null) {
    return {
      text: 'Any must-have facilities? (e.g. food included, AC)',
      suggestedQuestions: ['Food included', 'AC', 'Both', 'None']
    };
  }
  if (preferences.distance == null && preferences.lat == null) {
    return {
      text: 'How far are you okay with? Share "near me" for current location, or a max distance in km.',
      suggestedQuestions: ['Within 5 km', 'Within 10 km', 'Near me']
    };
  }
  return null;
}

function buildMatchFromPreferences(preferences) {
  const match = {};

  if (preferences.budget != null) match.price = { $lte: preferences.budget };
  if (preferences.gender) match.gender = { $in: [preferences.gender, 'Any'] };
  if (preferences.roomType) match.roomType = preferences.roomType;

  const facilityAll = [];
  if (preferences.food) facilityAll.push({ facilities: { $regex: /food|meal|breakfast|tiffin|mess/i } });
  if (preferences.ac) facilityAll.push({ facilities: { $regex: /ac|air\s*condition/i } });
  if (facilityAll.length) match.$and = facilityAll;

  return match;
}

async function fetchTop5Rooms(preferences) {
  const match = buildMatchFromPreferences(preferences);
  const lat = preferences.lat != null ? preferences.lat : DEFAULT_LOCATION.lat;
  const lng = preferences.lng != null ? preferences.lng : DEFAULT_LOCATION.lng;
  const maxDistanceKm = preferences.distance != null ? preferences.distance : 10;
  const maxDistance = maxDistanceKm * 1000;

  const pipeline = [
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distanceMeters',
        maxDistance,
        spherical: true,
        query: match
      }
    },
    { $addFields: { distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 2] } } },
    { $sort: { distanceMeters: 1 } },
    { $limit: 5 }
  ];

  try {
    return await Room.aggregate(pipeline);
  } catch (_) {
    return [];
  }
}

function formatRoomsForPrompt(rooms) {
  return rooms
    .map((r, i) => {
      const id = r._id.toString();
      const title = r.title || 'Room';
      const price = r.price != null ? `Rs ${r.price}/mo` : 'N/A';
      const dist = r.distanceKm != null ? `${r.distanceKm} km` : 'N/A';
      const facilities = Array.isArray(r.facilities) ? r.facilities.join(', ') : '';
      return `[${i + 1}] ID: ${id} | ${title} | ${price} | Distance: ${dist} | ${r.roomType} | ${r.gender} | Facilities: ${facilities}`;
    })
    .join('\n');
}

const SYSTEM_PERSONALITY = `You are StayNear AI, a friendly student housing advisor.
You only recommend from the given rooms. Never invent rooms.
Prefer cheaper, closer, and matching facilities. Explain reasoning clearly in simple English.`;

function buildOllamaPrompt(preferences, roomsFormatted) {
  const prefsText = JSON.stringify(preferences, null, 2);
  return `${SYSTEM_PERSONALITY}

User Preferences:
${prefsText}

Available Rooms:
${roomsFormatted}

Tasks:
1. Recommend best overall room from the list.
2. Recommend cheapest suitable room from the list.
3. Recommend closest room from the list.
4. Explain each in a friendly tone under 120 words total.
5. If no perfect match, explain the compromise.

At the end of your response, on a new line write exactly:
ROOM_IDS: <id1>,<id2>,<id3>
Use the exact room IDs from the Available Rooms list (comma-separated, no spaces).`;
}

async function callOllama(prompt) {
  return aiService.generate(prompt);
}

function parseRoomIdsFromResponse(responseText) {
  const match = responseText.match(/ROOM_IDS:\s*([^\n]+)/);
  if (!match) return [];
  return match[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
}

async function processChatMessage(sessionId, userMessage, lat, lng) {
  const session = getOrCreateSession(sessionId);
  if (!session) {
    return {
      type: 'follow_up',
      text: 'Please refresh and try again. (Session missing.)',
      suggestedQuestions: ['Under Rs 15,000', 'Single room']
    };
  }

  session.preferences = extractPreferencesFromMessage(userMessage, session.preferences);
  if (lat != null && lng != null) {
    session.preferences.lat = lat;
    session.preferences.lng = lng;
  }

  const nextQuestion = getNextMissingQuestion(session.preferences);
  if (nextQuestion) {
    session.lastAssistantText = nextQuestion.text;
    return {
      type: 'follow_up',
      text: nextQuestion.text,
      suggestedQuestions: nextQuestion.suggestedQuestions || []
    };
  }

  const rooms = await fetchTop5Rooms(session.preferences);
  if (rooms.length === 0) {
    session.lastAssistantText = "I couldn't find matching rooms right now. Please change your budget or filters and try again.";
    return {
      type: 'follow_up',
      text: session.lastAssistantText,
      suggestedQuestions: ['Increase budget', 'Any gender', 'Any room type']
    };
  }

  const roomsFormatted = formatRoomsForPrompt(rooms);
  const prompt = buildOllamaPrompt(session.preferences, roomsFormatted);

  let message;
  try {
    message = await callOllama(prompt);
  } catch (_) {
    message =
      `I found ${rooms.length} matching rooms. Here are the top 3 by distance and value:\n\n` +
      rooms
        .slice(0, 3)
        .map((r, i) => `${i + 1}. ${r.title} - Rs ${r.price}/mo, ${r.distanceKm} km away.`)
        .join('\n');
  }

  const roomIds = parseRoomIdsFromResponse(message);
  const finalIds = roomIds.length >= 3 ? roomIds : rooms.slice(0, 3).map((r) => r._id.toString());

  const recommendedRooms = finalIds
    .map((id) => rooms.find((r) => r._id.toString() === id) || rooms[0])
    .filter(Boolean)
    .slice(0, 3);

  const cleanMessage = message.replace(/\n?ROOM_IDS:[\s\S]*$/i, '').trim();
  const finalMessage = cleanMessage || 'Here are my top 3 picks for you.';

  if (session.lastAssistantText && finalMessage.toLowerCase() === session.lastAssistantText.toLowerCase()) {
    session.lastAssistantText = 'Unable to service this request right now. Please try with updated preferences.';
    return {
      type: 'follow_up',
      text: session.lastAssistantText,
      suggestedQuestions: ['Change budget', 'Any room type', 'Any facilities']
    };
  }

  session.lastAssistantText = finalMessage;

  return {
    type: 'recommendations',
    message: finalMessage,
    recommendedRooms: recommendedRooms.map((r) => ({
      roomId: r._id.toString(),
      title: r.title,
      price: r.price,
      address: r.address,
      distanceKm: r.distanceKm,
      image: getImageUrl(r.images?.[0]),
      roomType: r.roomType,
      gender: r.gender
    }))
  };
}

module.exports = {
  getOrCreateSession,
  extractPreferencesFromMessage,
  getNextMissingQuestion,
  fetchTop5Rooms,
  processChatMessage,
  sessionStore
};
