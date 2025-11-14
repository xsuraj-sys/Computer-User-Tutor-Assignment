const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/calendar');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    console.log('Cleared existing data');

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 12);
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      createdAt: new Date()
    });

    await testUser.save();
    console.log('Created test user');

    // Create sample events
    const sampleEvents = [
      {
        title: 'Team Meeting',
        description: 'Weekly team sync meeting',
        start: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // +1 hour
        allDay: false,
        location: 'Conference Room A',
        ownerId: testUser._id,
        color: '#4285f4',
        updatedAt: new Date()
      },
      {
        title: 'Project Deadline',
        description: 'Final submission for Q4 project',
        start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        allDay: true,
        location: '',
        ownerId: testUser._id,
        color: '#ea4335',
        updatedAt: new Date()
      },
      {
        title: 'Lunch with Client',
        description: 'Business lunch meeting',
        start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000), // 2 days from now at 12:00
        end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000), // +1 hour
        allDay: false,
        location: 'Downtown Restaurant',
        ownerId: testUser._id,
        color: '#34a853',
        updatedAt: new Date()
      },
      {
        title: 'Weekly Standup',
        description: 'Daily standup meeting',
        start: new Date(Date.now() + 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // Tomorrow at 9:00
        end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 9 * 30 * 60 * 1000), // +30 minutes
        allDay: false,
        location: 'Team Room',
        ownerId: testUser._id,
        recurringRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
        color: '#fbbc04',
        updatedAt: new Date()
      },
      {
        title: 'Monthly Review',
        description: 'Monthly performance review',
        start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // 7 days from now at 14:00
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // +1 hour
        allDay: false,
        location: 'Manager Office',
        ownerId: testUser._id,
        recurringRule: 'FREQ=MONTHLY;BYMONTHDAY=1',
        color: '#8e44ad',
        updatedAt: new Date()
      },
      {
        title: 'Yoga Class',
        description: 'Weekly yoga session',
        start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // 5 days from now at 18:00
        end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // +1 hour
        allDay: false,
        location: 'Yoga Studio',
        ownerId: testUser._id,
        recurringRule: 'FREQ=WEEKLY;BYDAY=WE',
        color: '#16a085',
        updatedAt: new Date()
      },
      {
        title: 'Birthday Party',
        description: 'John\'s birthday celebration',
        start: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // 10 days from now at 19:00
        end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000), // +3 hours
        allDay: false,
        location: 'John\'s House',
        ownerId: testUser._id,
        color: '#e74c3c',
        updatedAt: new Date()
      },
      {
        title: 'Conference Call',
        description: 'International team call',
        start: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 6 days from now at 8:00
        end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // +1 hour
        allDay: false,
        location: 'Virtual Meeting',
        ownerId: testUser._id,
        color: '#2c3e50',
        updatedAt: new Date()
      }
    ];

    await Event.insertMany(sampleEvents);
    console.log(`Created ${sampleEvents.length} sample events`);

    console.log('\nSeed data created successfully!');
    console.log('Test credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('\nYou can now login with these credentials to see the sample events.');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
seedData();
