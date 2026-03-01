# StayNear Backend

Production-ready Node.js + Express backend for StayNear (Online PG/Room Finder with AI recommendations).

## Tech

- Node.js + Express
- MongoDB + Mongoose
- JWT (access + refresh token)
- Cloudinary image uploads
- OpenAI integration for room recommendations

## Folder Structure

```txt
server/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
  app.js
```

## Setup

1. Install dependencies:

```bash
cd server
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Fill `.env` values (MongoDB, JWT secrets, Cloudinary, OpenAI).

4. Run development server:

```bash
npm run dev
```

5. Production start:

```bash
npm start
```

## Core Features Implemented

- Authentication with roles (`user`, `owner`)
- Access token in response body + refresh token in `httpOnly` cookie
- Owner-only room CRUD
- Cloudinary multiple image upload
- Geospatial room search using `2dsphere` index
- Nearby API (`/api/rooms/nearby`)
- Favorites API
- AI recommendation API (`/api/ai/recommend-room`)
- Centralized error handling

## Notes

- Route directions from user to room are typically handled in frontend map SDK (Google Maps/Leaflet).
- AI endpoint falls back to deterministic ranking when OpenAI is unavailable.
- Use strong random secrets for JWT in production.

## API Docs

See `API_DOCS.md`.
