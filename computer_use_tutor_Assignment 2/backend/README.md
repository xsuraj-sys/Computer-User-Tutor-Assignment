# Calendar API Backend

A RESTful API server for the Calendar application built with Express.js.

## Features

- ✅ RESTful API endpoints for calendar events
- ✅ CORS enabled for frontend integration
- ✅ Input validation and error handling
- ✅ In-memory data storage (easily replaceable with database)
- ✅ Proper folder structure (MVC pattern)

## Project Structure

```
backend/
├── controllers/     # Route controllers
├── db/             # Database layer
├── middlewares/    # Custom middleware
├── routes/         # API routes
├── index.js        # Main server file
└── package.json    # Dependencies and scripts
```

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `GET /api/events/date/:date` - Get events for specific date
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
# or
npm run dev
```

3. Server runs on: `http://localhost:3000`

## Event Data Structure

```json
{
  "id": 1,
  "title": "Team Meeting",
  "description": "Weekly team sync",
  "date": "2025-11-15T04:30:00.000Z",
  "duration": 60,
  "color": "#4285f4"
}
```

## Example API Usage

### Create Event
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Meeting",
    "description": "Project discussion",
    "date": "2025-11-20T10:00:00.000Z",
    "duration": 90,
    "color": "#34a853"
  }'
```

### Get Events by Date
```bash
curl http://localhost:3000/api/events/date/2025-11-15
```

## Development

The backend uses:
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **In-memory storage** - For development (replace with database in production)

## Production Notes

For production deployment:
1. Replace in-memory storage with a real database (MongoDB, PostgreSQL, etc.)
2. Add authentication middleware
3. Add rate limiting
4. Use environment variables for configuration
5. Add proper logging
