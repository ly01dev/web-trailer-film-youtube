const mongoose = require('mongoose');
const User = require('./models/User');

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://admin:password123@mongodb:27017/phim-youtube?authSource=admin');
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'admin@test.com' });
    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email);
      await mongoose.disconnect();
      return;
    }

    // Create test user with valid password format
    const testUser = new User({
      username: 'admin',
      email: 'admin@test.com',
      password: 'Admin123!', // Has uppercase, number, and special char
      role: 'admin'
    });

    await testUser.save();
    console.log('✅ Test user created successfully:');
    console.log('   Username:', testUser.username);
    console.log('   Email:', testUser.email);
    console.log('   Password: Admin123!');
    console.log('   Role:', testUser.role);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    process.exit(1);
  }
}

createTestUser(); 