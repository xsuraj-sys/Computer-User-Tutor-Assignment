const express = require('express');
const cors = require('cors');
const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middlewares/errorHandler');
const connectDB = require('./db/connection');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Calendar API Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Calendar API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      events: {
        getAll: 'GET /api/events',
        getById: 'GET /api/events/:id',
        getByDate: 'GET /api/events/date/:date',
        create: 'POST /api/events',
        update: 'PUT /api/events/:id',
        delete: 'DELETE /api/events/:id'
      }
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: {
      root: 'GET /',
      health: 'GET /api/health',
      events: 'GET /api/events'
    }
  });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Calendar API Server running on http://localhost:${PORT}`);
    console.log(`📅 Available endpoints:`);
    console.log(`   GET  /              - API documentation`);
    console.log(`   GET  /api/health    - Health check`);
    console.log(`   GET  /api/events    - Get all events`);
    console.log(`   GET  /api/events/:id - Get event by ID`);
    console.log(`   GET  /api/events/date/:date - Get events for specific date`);
    console.log(`   POST /api/events    - Create new event`);
    console.log(`   PUT  /api/events/:id - Update event`);
    console.log(`   DELETE /api/events/:id - Delete event`);
  });
}

// Export app for testing
module.exports = app;
