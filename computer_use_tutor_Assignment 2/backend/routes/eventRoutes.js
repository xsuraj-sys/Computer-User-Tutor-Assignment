const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  getEventsByDate,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const auth = require('../middlewares/auth');

// @route   GET /api/events
// @desc    Get all events for authenticated user
// @access  Private
router.get('/', auth, getAllEvents);

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Private
router.get('/:id', auth, getEventById);

// @route   GET /api/events/date/:date
// @desc    Get events for specific date
// @access  Private
router.get('/date/:date', auth, getEventsByDate);

// @route   POST /api/events
// @desc    Create new event
// @access  Private
router.post('/', auth, createEvent);

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private
router.put('/:id', auth, updateEvent);

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private
router.delete('/:id', auth, deleteEvent);

module.exports = router;
