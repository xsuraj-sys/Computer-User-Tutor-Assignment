// Jest setup file
const mongoose = require('mongoose');

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGO_URI = 'mongodb://localhost:27017/calendar-test';

// Global test setup
beforeAll(async () => {
  // Only connect if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
});

// Global test teardown
afterAll(async () => {
  await mongoose.connection.close();
});

// Clear database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});
