const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Event = require('../models/Event');

describe('Events API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Connection is handled by setup.js
  });

  afterAll(async () => {
    // Clean up
    await User.deleteMany({});
    await Event.deleteMany({});
  });

  beforeEach(async () => {
    // Clear data before each test
    await User.deleteMany({});
    await Event.deleteMany({});

    // Create a user and get auth token with unique email
    const uniqueEmail = `test${Date.now()}${Math.random().toString(36).substring(2, 7)}@example.com`;
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: uniqueEmail,
        password: 'Pass123'
      });

    console.log('Registration response:', registerResponse.body);
    
    if (registerResponse.body.error) {
      throw new Error(`Registration failed: ${registerResponse.body.error}`);
    }
    
    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('GET /api/events', () => {
    it('should get all events for authenticated user', async () => {
      // Create test events - convert userId to ObjectId
      await Event.create([
        {
          title: 'Test Event 1',
          start: new Date('2025-01-01T10:00:00Z'),
          end: new Date('2025-01-01T11:00:00Z'),
          ownerId: new mongoose.Types.ObjectId(userId)
        },
        {
          title: 'Test Event 2',
          start: new Date('2025-01-02T14:00:00Z'),
          end: new Date('2025-01-02T15:00:00Z'),
          ownerId: new mongoose.Types.ObjectId(userId)
        }
      ]);

      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('title', 'Test Event 1');
      expect(response.body[1]).toHaveProperty('title', 'Test Event 2');
    });

    it('should filter events by date range', async () => {
      // Create test events - convert userId to ObjectId
      await Event.create([
        {
          title: 'Event in Range',
          start: new Date('2025-01-15T10:00:00Z'),
          end: new Date('2025-01-15T11:00:00Z'),
          ownerId: new mongoose.Types.ObjectId(userId)
        },
        {
          title: 'Event Outside Range',
          start: new Date('2025-02-01T10:00:00Z'),
          end: new Date('2025-02-01T11:00:00Z'),
          ownerId: new mongoose.Types.ObjectId(userId)
        }
      ]);

      const response = await request(app)
        .get('/api/events')
        .query({
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-31T23:59:59Z'
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('title', 'Event in Range');
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/events')
        .expect(401);
    });
  });

  describe('POST /api/events', () => {
    it('should create a new event', async () => {
      const eventData = {
        title: 'New Event',
        description: 'Event description',
        start: '2025-01-01T10:00:00Z',
        end: '2025-01-01T11:00:00Z',
        allDay: false,
        location: 'Test Location',
        color: '#4285f4'
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(201);

      expect(response.body).toHaveProperty('title', 'New Event');
      expect(response.body).toHaveProperty('description', 'Event description');
      expect(response.body.ownerId).toHaveProperty('_id', userId);
    });

    it('should detect event conflicts', async () => {
      // Create first event - convert userId to ObjectId
      await Event.create({
        title: 'Existing Event',
        start: new Date('2025-01-01T10:00:00Z'),
        end: new Date('2025-01-01T11:00:00Z'),
        ownerId: new mongoose.Types.ObjectId(userId)
      });

      // Try to create conflicting event
      const eventData = {
        title: 'Conflicting Event',
        start: '2025-01-01T10:30:00Z',
        end: '2025-01-01T11:30:00Z',
        allDay: false
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Event conflicts with existing events');
      expect(response.body).toHaveProperty('conflictingEventIds');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '',
          start: '2025-01-01T10:00:00Z',
          end: '2025-01-01T09:00:00Z' // End before start
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/events/:id', () => {
    let eventId;

    beforeEach(async () => {
      // Create an event to update - convert userId to ObjectId
      const event = await Event.create({
        title: 'Original Event',
        start: new Date('2025-01-01T10:00:00Z'),
        end: new Date('2025-01-01T11:00:00Z'),
        ownerId: new mongoose.Types.ObjectId(userId)
      });
      eventId = event._id;
    });

    it('should update an event', async () => {
      const response = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Event',
          description: 'Updated description'
        })
        .expect(200);

      expect(response.body).toHaveProperty('title', 'Updated Event');
      expect(response.body).toHaveProperty('description', 'Updated description');
    });

    it('should not update event with invalid data', async () => {
      const response = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          start: '2025-01-01T12:00:00Z',
          end: '2025-01-01T11:00:00Z' // End before start
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should not update non-existent event', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .put(`/api/events/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /api/events/:id', () => {
    let eventId;

    beforeEach(async () => {
      // Create an event to delete - convert userId to ObjectId
      const event = await Event.create({
        title: 'Event to Delete',
        start: new Date('2025-01-01T10:00:00Z'),
        end: new Date('2025-01-01T11:00:00Z'),
        ownerId: new mongoose.Types.ObjectId(userId)
      });
      eventId = event._id;
    });

    it('should delete an event', async () => {
      await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify event is deleted
      const event = await Event.findById(eventId);
      expect(event).toBeNull();
    });

    it('should not delete non-existent event', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/api/events/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
