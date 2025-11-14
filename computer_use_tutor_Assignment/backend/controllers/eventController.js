const Event = require('../models/Event');
const { generateRecurrenceInstances, checkEventConflicts, generateRRuleString } = require('../utils/rruleHelper');

// Get events for authenticated user with range and recurrence support
const getAllEvents = async (req, res) => {
  try {
    const { start, end } = req.query;
    
    let query = { ownerId: req.userId };
    
    // If start and end parameters are provided, filter by date range
    if (start && end) {
      const rangeStart = new Date(start);
      const rangeEnd = new Date(end);
      
      query.$or = [
        // Events that start within the range
        { start: { $gte: rangeStart, $lt: rangeEnd } },
        // Events that end within the range
        { end: { $gt: rangeStart, $lte: rangeEnd } },
        // Events that span the entire range
        { start: { $lte: rangeStart }, end: { $gte: rangeEnd } }
      ];
    }
    
    const events = await Event.find(query)
      .sort({ start: 1 })
      .populate('ownerId', 'name email');
    
    // Generate recurrence instances if range is provided
    let allEvents = [...events];
    if (start && end) {
      const rangeStart = new Date(start);
      const rangeEnd = new Date(end);
      
      const recurringEvents = events.filter(event => event.recurringRule);
      for (const event of recurringEvents) {
        const instances = generateRecurrenceInstances(event, rangeStart, rangeEnd);
        allEvents.push(...instances);
      }
      
      // Sort all events by start time
      allEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
    }
    
    res.json(allEvents);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch events' });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, ownerId: req.userId })
      .populate('ownerId', 'name email');
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch event' });
  }
};

// Get events by date
const getEventsByDate = async (req, res) => {
  try {
    const targetDate = new Date(req.params.date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const events = await Event.find({
      ownerId: req.userId,
      start: {
        $gte: targetDate,
        $lt: nextDay
      }
    }).sort({ start: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch events for date' });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    const { title, description, start, end, allDay, location, attendees, color, recurringRule, recurrenceOptions } = req.body;
    
    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Event title is required' });
    }
    
    if (!start || !end) {
      return res.status(400).json({ error: 'Event start and end times are required' });
    }
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (startDate >= endDate) {
      return res.status(400).json({ error: 'Event end time must be after start time' });
    }
    
    // Check for conflicts
    const eventData = {
      title: title.trim(),
      description: description?.trim() || '',
      start: startDate,
      end: endDate,
      allDay: allDay || false,
      location: location?.trim() || '',
      ownerId: req.userId,
      attendees: attendees || [],
      color: color || '#4285f4'
    };
    
    // Check for conflicts (only for non-allDay events)
    if (!eventData.allDay) {
      const conflicts = await checkEventConflicts(Event, eventData, req.userId);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          error: 'Event conflicts with existing events',
          conflictingEventIds: conflicts 
        });
      }
    }
    
    // Handle recurrence
    if (recurrenceOptions) {
      eventData.recurringRule = generateRRuleString(recurrenceOptions);
    } else if (recurringRule) {
      eventData.recurringRule = recurringRule;
    }
    
    const newEvent = new Event(eventData);
    await newEvent.save();
    
    await newEvent.populate('ownerId', 'name email');
    res.status(201).json(newEvent);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Validation failed: ${messages.join(', ')}` });
    }
    res.status(400).json({ error: error.message || 'Failed to create event' });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const updates = req.body;
    
    // Validate that at least one field is being updated
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Validate title if provided
    if (updates.title && !updates.title.trim()) {
      return res.status(400).json({ error: 'Event title cannot be empty' });
    }
    
    // Check if user owns the event
    const existingEvent = await Event.findOne({ _id: eventId, ownerId: req.userId });
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Validate start/end times if provided
    if (updates.start || updates.end) {
      const startDate = updates.start ? new Date(updates.start) : existingEvent.start;
      const endDate = updates.end ? new Date(updates.end) : existingEvent.end;
      
      if (startDate >= endDate) {
        return res.status(400).json({ error: 'Event end time must be after start time' });
      }
    }
    
    // Check for conflicts if updating time-related fields
    if ((updates.start || updates.end) && !existingEvent.allDay) {
      const conflictData = {
        start: updates.start ? new Date(updates.start) : existingEvent.start,
        end: updates.end ? new Date(updates.end) : existingEvent.end,
        allDay: existingEvent.allDay
      };
      
      const conflicts = await checkEventConflicts(Event, conflictData, req.userId, eventId);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          error: 'Event conflicts with existing events',
          conflictingEventIds: conflicts 
        });
      }
    }
    
    // Handle recurrence updates
    if (updates.recurrenceOptions) {
      updates.recurringRule = generateRRuleString(updates.recurrenceOptions);
      delete updates.recurrenceOptions;
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        ...updates,
        ...(updates.title && { title: updates.title.trim() }),
        ...(updates.description && { description: updates.description.trim() }),
        ...(updates.location && { location: updates.location.trim() })
      },
      { 
        new: true, // Return updated document
        runValidators: true // Run model validators
      }
    ).populate('ownerId', 'name email');
    
    res.json(updatedEvent);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Validation failed: ${messages.join(', ')}` });
    }
    res.status(400).json({ error: error.message || 'Failed to update event' });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Check if user owns the event
    const event = await Event.findOne({ _id: eventId, ownerId: req.userId });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    await Event.findByIdAndDelete(eventId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to delete event' });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  getEventsByDate,
  createEvent,
  updateEvent,
  deleteEvent
};
