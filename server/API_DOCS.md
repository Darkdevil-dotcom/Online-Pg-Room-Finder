# StayNear API Documentation

Base URL: `http://localhost:5000`

## Auth

### POST `/api/auth/register`
Body:

```json
{
  "name": "Sairam",
  "email": "user@example.com",
  "password": "secret123",
  "role": "owner"
}
```

### POST `/api/auth/login`
Body:

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

### POST `/api/auth/refresh`
Uses refresh token cookie.

### POST `/api/auth/logout`
Clears refresh token cookie.

### GET `/api/auth/me`
Protected header:
`Authorization: Bearer <access_token>`

## Rooms

### POST `/api/rooms`
Protected (`owner`) + multipart form-data.

Fields:
- `title`
- `price`
- `deposit`
- `description`
- `address`
- `pincode`
- `gender` (`Male`/`Female`/`Any`)
- `facilities` (JSON array or comma string)
- `roomType` (`Single`/`Double`/`Triple`)
- `contactNumber`
- `images` (multiple files)

Optional:
- `lat`
- `lng`

### PUT `/api/rooms/:id`
Protected (`owner`) + multipart form-data.

### DELETE `/api/rooms/:id`
Protected (`owner`).

### GET `/api/rooms`
Query params:
- `page`, `limit`
- `minPrice`, `maxPrice`
- `gender`, `roomType`
- `facilities`
- `sortBy` (`createdAt`/`price`)
- `sortOrder` (`asc`/`desc`)
- optional `lat`, `lng` for nearest sorting

### GET `/api/rooms/:id`
Room detail.

### GET `/api/rooms/nearby?lat=12.9&lng=77.5&radius=5`
Radius in km.

Supports filters:
- `minPrice`, `maxPrice`, `gender`, `roomType`, `facilities`

### GET `/api/rooms/compare?ids=<id1>,<id2>,<id3>&lat=<lat>&lng=<lng>`
Compare up to 3 rooms.

## Favorites

All routes protected.

### GET `/api/favorites`
List favorite rooms.

### POST `/api/favorites/:roomId`
Add favorite.

### DELETE `/api/favorites/:roomId`
Remove favorite.

## AI

### POST `/api/ai/recommend-room`
Body:

```json
{
  "minBudget": 5000,
  "maxBudget": 12000,
  "gender": "Any",
  "roomType": "Single",
  "facilities": ["WiFi", "AC", "Food"],
  "maxDistanceKm": 6,
  "lat": 12.9716,
  "lng": 77.5946
}
```

Returns:
- `summary`
- `recommendations` (up to 3)
- `source` (`openai` or fallback)

## Health

### GET `/api/health`
Basic health check.
