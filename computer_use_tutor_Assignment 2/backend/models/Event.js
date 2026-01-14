const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    default: ''
  },
  start: {
    type: Date,
    required: [true, 'Event start time is required']
  },
  end: {
    type: Date,
    required: [true, 'Event end time is required']
  },
  allDay: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters'],
    default: ''
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Event owner is required']
  },
  recurringRule: {
    type: String,
    trim: true,
    default: null
  },
  recurrenceId: {
    type: Date,
    default: null
  },
  attendees: [{
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address for attendee'
    }
  }],
  color: {
    type: String,
    default: '#4285f4',
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
eventSchema.index({ ownerId: 1 });
eventSchema.index({ start: 1, end: 1 });
eventSchema.index({ ownerId: 1, start: 1 });
eventSchema.index({ recurrenceId: 1 });

// Virtual for duration in minutes
eventSchema.virtual('duration').get(function() {
  return Math.round((this.end - this.start) / (1000 * 60));
});

// Ensure virtual fields are serialized
eventSchema.set('toJSON', { virtuals: true });

// Update updatedAt before saving
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Event', eventSchema);
