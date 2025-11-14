const Event = require('../models/Event');
const connectDB = require('./connection');

// Event operations using MongoDB
const eventDb = {
  // Get all events
  getAllEvents: async () => {
    try {
      // Ensure database connection
      await connectDB();
      const events = await Event.find().sort({ date: 1 });
      return events;
    } catch (error) {
      throw new Error('Failed to fetch events from database');
    }
  },

  // Get event by ID
  getEventById: async (id) => {
    try {
      const event = await Event.findById(id);
      return event;
    } catch (error) {
      throw new Error('Failed to fetch event from database');
    }
  },

  // Get events by date
  getEventsByDate: async (date) => {
    try {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const events = await Event.find({
        date: {
          $gte: targetDate,
          $lt: nextDay
        }
      }).sort({ date: 1 });

      return events;
    } catch (error) {
      throw new Error('Failed to fetch events for date from database');
    }
  },

  // Create new event
  createEvent: async (eventData) => {
    try {
      const event = new Event(eventData);
      const savedEvent = await event.save();
      return savedEvent;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        throw new Error(`Validation failed: ${messages.join(', ')}`);
      }
      throw new Error('Failed to create event in database');
    }
  },

  // Update event
  updateEvent: async (id, updates) => {
    try {
      const event = await Event.findByIdAndUpdate(
        id,
        updates,
        { 
          new: true, // Return updated document
          runValidators: true // Run model validators
        }
      );
      return event;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        throw new Error(`Validation failed: ${messages.join(', ')}`);
      }
      throw new Error('Failed to update event in database');
    }
  },

  // Delete event
  deleteEvent: async (id) => {
    try {
      const result = await Event.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new Error('Failed to delete event from database');
    }
  }
};

module.exports = eventDb;
