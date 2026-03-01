# StayNear – PG / Room Finder

A full-stack room finder with an **AI recommendation chatbot** that runs **100% offline** using a local LLM (Ollama). No paid APIs (no OpenAI or other cloud LLM required).

---

## Features

- **Conversational chatbot** (WhatsApp-style UI) for PG recommendations
- **Local LLM** via Ollama (phi3) – no paid APIs
- Conversation memory and follow-up questions (budget → gender → room type → facilities → distance)
- **Top 3 room recommendations** with short explanations (best overall, cheapest, closest)
- Map view, compare table, owner dashboard, favorites
- Responsive mobile design

---

## Prerequisites

- **Node.js** 18+ (for `server` and `client`)
- **MongoDB** (local or Atlas)
- **Ollama** (for the chatbot LLM)

---

## Ollama setup (required for the chatbot)

The StayNear chatbot uses **Ollama** with the **phi3** model. No API keys or paid services.

### 1. Install Ollama

- **Windows / macOS / Linux:** [https://ollama.ai](https://ollama.ai) – download and install.

### 2. Pull the phi3 model

```bash
ollama pull phi3
```

### 3. Run Ollama (if not running as a service)

Ollama usually runs as a background service. If not:

```bash
ollama serve
```

The API will be at **http://localhost:11434**. The chatbot calls `POST http://localhost:11434/api/generate` with `model: "phi3"` and `stream: false`.

### 4. Optional environment variables (server)

In `server/.env` you can set:

- `OLLAMA_URL=http://localhost:11434` (default)
- `OLLAMA_CHAT_MODEL=phi3` (default)

---

## Project setup

### Backend (server)

```bash
cd server
npm install
cp .env.example .env   # edit with your MongoDB URI, etc.
npm run dev
```

Runs at **http://localhost:5000** by default.

### Frontend (client)

```bash
cd client
npm install
npm start
```

Runs at **http://localhost:3000**. Set `REACT_APP_API_URL=http://localhost:5000/api` in `client/.env` if the API is on a different host.

---

## Running the app

1. Start **MongoDB**.
2. Start **Ollama** and ensure `phi3` is pulled (`ollama pull phi3`).
3. Start the **server**: `cd server && npm run dev`.
4. Start the **client**: `cd client && npm start`.
5. Open **http://localhost:3000** and use the floating chat button (bottom-right) to talk to StayNear AI.

---

## Chatbot flow (no paid APIs)

- **Session:** Stored in memory on the server by `sessionId` (frontend sends `sessionId` from `localStorage`).
- **Preferences:** Extracted step by step: budget → gender → room type → facilities (food/AC) → distance/location.
- **Follow-ups:** If something is missing, the bot asks one question and suggests quick-reply options.
- **MongoDB:** When enough preferences are collected, rooms are queried (price ≤ budget, gender, room type, facilities, geospatial distance). Top 5 by distance are passed to the LLM.
- **Ollama:** A single prompt is sent to `http://localhost:11434/api/generate` (phi3) with user preferences and the 5 rooms. The model returns a short explanation and the best 3 room IDs.
- **Response:** The API returns `message` (AI text) and `recommendedRooms` (top 3 with image, price, distance, link). The UI shows room cards and a “Compare these” button that opens the compare page with those IDs.

---

## Restrictions

- **No paid APIs** – the recommendation chatbot does not use OpenAI or any paid service.
- **Offline-capable** – with Ollama and MongoDB running locally, the chatbot works without internet (after phi3 is pulled).
- Code is modular: Ollama logic lives in `server/services/ollamaChatService.js`; the existing OpenAI-based `aiService.js` remains for the legacy `/api/ai/recommend-room` endpoint if you still use it.

---

## License

MIT.
