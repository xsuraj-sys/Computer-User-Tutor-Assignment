# ChronoGrid

A high-fidelity Google Calendar clone built with the MERN stack, featuring professional UI/UX, full event management, recurrence support, and real-time drag & drop functionality.

## Overview

ChronoGrid is a modern, production-ready calendar application that replicates the core functionality of Google Calendar with a clean, professional interface. Built with React, Node.js, Express, MongoDB, and modern web technologies, it provides a seamless calendar experience with advanced features like recurring events, conflict detection, and responsive design.

## Features

### Frontend
- **Multiple Calendar Views**: Month, Week, and Day views with smooth transitions
- **Event Management**: Full CRUD operations with intuitive modal interface
- **Drag & Drop**: Real-time event rescheduling with snap-to-15-minute increments
- **Recurrence Support**: Create recurring events with RRULE patterns
- **Professional UI**: Modern glass morphism effects with blurry modal overlays
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Authentication**: JWT-based login/register with persistent sessions
- **Public Calendar**: Read-only calendar view for unauthenticated users
- **Event Colors**: Customizable event colors with visual indicators
- **Smooth Animations**: CSS transitions and micro-interactions

### Backend
- **RESTful API**: Clean, well-documented API endpoints
- **JWT Authentication**: Secure user authentication with bcrypt password hashing
- **Event CRUD**: Full event lifecycle management with validation
- **Recurrence Engine**: RRULE-based recurrence with instance generation
- **Conflict Detection**: Smart event conflict prevention
- **MongoDB Integration**: Optimized queries with proper indexing
- **Error Handling**: Comprehensive error handling and validation
- **Testing Suite**: Jest + Supertest test coverage (17/17 tests passing)

## Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Redux Toolkit** - State management
- **React Router DOM** - Client-side routing
- **React Big Calendar** - Calendar component library
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Moment.js** - Date manipulation
- **Date-fns** - Modern date utilities
- **Vite** - Fast build tool and dev server

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **RRULE** - Recurrence rule parsing and generation
- **Jest** - Testing framework
- **Supertest** - HTTP assertion testing

## Folder Structure

```
computer_use_tutor_Assignment/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── eventController.js
│   ├── db/
│   │   ├── connection.js
│   │   └── events.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Event.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── eventRoutes.js
│   ├── scripts/
│   │   └── seedEvents.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── events.test.js
│   │   └── setup.js
│   ├── utils/
│   │   └── rruleHelper.js
│   ├── .env.example
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Calendar.jsx
│   │   │   ├── CalendarHeader.jsx
│   │   │   ├── EnhancedEventModal.jsx
│   │   │   ├── EventModal.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── PublicCalendar.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── DayView.jsx
│   │   │   ├── MonthView.jsx
│   │   │   └── WeekView.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   └── calendarSlice.js
│   │   │   └── store.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Environment Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/calendar
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
```

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Documentation

### Authentication Routes

**POST /api/auth/register**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**POST /api/auth/login**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Event Routes (Require JWT Authentication)

**GET /api/events**
- Query parameters: `start` (ISO date), `end` (ISO date)
- Returns events within date range with recurrence instances

**POST /api/events**
```json
{
  "title": "Meeting",
  "description": "Team meeting",
  "start": "2025-01-01T10:00:00Z",
  "end": "2025-01-01T11:00:00Z",
  "allDay": false,
  "location": "Conference Room",
  "color": "#4285f4",
  "recurringRule": "FREQ=WEEKLY;BYDAY=MO"
}
```

**PUT /api/events/:id**
- Update existing event

**DELETE /api/events/:id**
- Delete event

### Authentication Header
All event routes require JWT authentication:
```
Authorization: Bearer <token>
```

## Event Business Logic

### Recurrence Implementation
- Uses RRULE standard for recurrence patterns
- Server generates recurrence instances for requested date ranges
- Supports daily, weekly, and monthly recurrence
- Recurring events stored with `recurringRule` field

### Conflict Detection
- Non-allDay events are checked for time conflicts
- Conflict detection uses: `start < newEnd && end > newStart`
- Returns 409 Conflict with conflicting event IDs
- AllDay events bypass conflict detection

### Drag & Drop Updates
- Events can be dragged to new time slots
- Resize handles for duration adjustments
- Updates sent to server with UTC ISO timestamps
- Optimistic updates with rollback on error

### Single Instance Edits
- Recurring events can be edited as single instances
- Creates override events with `recurrenceId` referencing original
- Maintains series integrity while allowing exceptions

## UI/UX Guidelines

### Color Palette
- **Primary Accent**: `#1a73e8` (Google Blue)
- **Secondary Accent**: `#ea4335` (Google Red) for delete actions
- **Neutral Background**: `#f8f9fa` (Light gray)
- **Event Colors**: 6 distinct colors for visual categorization
- **Text Colors**: `#3c4043` (Primary), `#70757a` (Secondary)

### Typography
- **Font Family**: Roboto, Arial, sans-serif (Google Fonts stack)
- **Headings**: 22px, font-weight 400
- **Body Text**: 14px-16px, line-height 1.4
- **UI Text**: 11px-14px for controls and labels

### Spacing & Layout
- **Baseline Grid**: 4px increments
- **Margins/Padding**: Multiples of 8px (8, 16, 24, 32)
- **Responsive Breakpoints**:
  - Mobile: < 640px
  - Tablet: 641-1024px  
  - Desktop: ≥ 1024px

### Animations & Transitions
- **Modal Overlay**: Blurry glass morphism with backdrop-filter
- **Hover States**: 150-250ms ease transitions
- **Modal Entrance**: Fade-in with translateY animation
- **Drag Interactions**: Micro-interactions with preview shadows

## Installation Commands

### Quick Start
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

### Test Suite
```bash
cd backend && npm test
```

### Seed Database
```bash
cd backend && npm run seed
```

## Test User / Seed Script

The project includes a comprehensive seed script that creates:

- **Test User**: 
  - Email: `test@example.com`
  - Password: `password123`

- **Sample Events**:
  - One-time events (meetings, deadlines, parties)
  - Recurring events (daily standups, weekly yoga, monthly reviews)
  - Various colors and time slots

Run the seed script:
```bash
cd backend && npm run seed
```

## Future Enhancements

### Planned Features
- **Advanced Recurrence UI**: More intuitive recurrence rule creation
- **Calendar Sharing**: Share calendars with other users
- **Event Reminders**: Email/SMS notifications for upcoming events
- **Calendar Import/Export**: ICS file support
- **Advanced Search**: Full-text search across events
- **Calendar Themes**: Dark mode and custom themes
- **Event Attachments**: File uploads for event documents
- **Calendar Sync**: Integration with external calendar services
- **Mobile App**: React Native version
- **Real-time Updates**: WebSocket integration for live updates

### Technical Improvements
- **Performance Optimization**: Virtual scrolling for large event sets
- **Accessibility**: Enhanced screen reader support
- **Offline Support**: Service worker for offline functionality
- **Internationalization**: Multi-language support
- **Advanced Analytics**: Usage statistics and insights

## Screenshots

*(Screenshots would be placed here in a production environment)*
- `/assets/screenshot-home.png` - Public calendar view
- `/assets/screenshot-my-calendar.png` - Authenticated calendar
- `/assets/screenshot-modal.png` - Event creation modal
- `/assets/screenshot-mobile.png` - Mobile responsive view

---

**ChronoGrid** - Modern calendar management reimagined. Built with care and attention to detail for professional use cases.
