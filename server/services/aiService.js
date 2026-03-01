/**
 * StayNear AI service – local Ollama only (no OpenAI).
 * POST http://localhost:11434/api/generate with model phi3.
 */

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'phi3';

/**
 * Call local Ollama server. Returns response.response as plain text.
 * @param {string} prompt - Full prompt for the model
 * @returns {Promise<string>} AI response text
 */
async function generate(prompt) {
  const url = `${OLLAMA_URL}/api/generate`;
  const body = { model: OLLAMA_MODEL, prompt, stream: false };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Ollama error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return (data.response || '').trim();
}

// --- Rule-based fallback for /recommend-room (no LLM) ---

function scoreRoom(room, prefs) {
  let score = 0;
  if (prefs.maxBudget != null && room.price <= prefs.maxBudget) score += 3;
  if (prefs.gender && (room.gender === prefs.gender || room.gender === 'Any')) score += 2;
  if (prefs.roomType && room.roomType === prefs.roomType) score += 2;
  if (Array.isArray(prefs.facilities) && prefs.facilities.length) {
    const hitCount = prefs.facilities.filter((f) => room.facilities && room.facilities.includes(f)).length;
    score += hitCount;
  }
  if (typeof room.distanceKm === 'number') {
    score += Math.max(0, 3 - room.distanceKm / 2);
  }
  return score;
}

/**
 * Used by POST /api/ai/recommend-room. Returns top 3 by score (rule-based).
 */
function recommendRoomsWithAI(preferences, rooms) {
  if (!rooms.length) {
    return {
      source: 'fallback',
      recommendations: [],
      summary: 'No rooms match current filters.',
    };
  }

  const ranked = rooms
    .map((room) => ({
      roomId: room._id,
      title: room.title,
      price: room.price,
      score: Number(scoreRoom(room, preferences).toFixed(2)),
      reason: 'Ranked by budget, preference match, facilities, and distance.',
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return {
    source: 'fallback',
    recommendations: ranked,
    summary: 'Recommendations based on your preferences.',
  };
}

module.exports = {
  generate,
  recommendRoomsWithAI,
};
