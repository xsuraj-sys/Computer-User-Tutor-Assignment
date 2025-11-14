const mongoose = require('mongoose');
const Event = require('./models/Event');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const seedEvents = [
  {
    title: 'Team Meeting',
    description: 'Weekly team sync',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 10, 0),
    duration: 60,
    color: '#4285f4'
  },
  {
    title: 'Lunch with Client',
    description: 'Discuss project requirements',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 3, 12, 30),
    duration: 90,
    color: '#34a853'
  },
  {
    title: 'Code Review',
    description: 'Review new features',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 5, 15, 0),
    duration: 45,
    color: '#fbbc04'
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing events
    await Event.deleteMany({});
    console.log('🗑️  Cleared existing events');
    
    // Insert new events
    const events = await Event.insertMany(seedEvents);
    console.log('🌱 Database seeded with events:');
    events.forEach(event => {
      console.log(`   - ${event.title} (${event.date.toISOString()})`);
    });
    
    console.log('✅ Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
