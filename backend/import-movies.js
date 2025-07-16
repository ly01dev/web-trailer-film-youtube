const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

// Import Movie model
const Movie = require('./models/Movie');

async function importMovies() {
  try {
    // Connect to MongoDB using environment variable
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password123@mongodb:27017/phim-youtube?authSource=admin';
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Read movies data from JSON file
    console.log('📖 Reading movies.json...');
    const moviesData = JSON.parse(fs.readFileSync('./movies.json', 'utf8'));
    const movies = moviesData.data;
    
    console.log(`📦 Found ${movies.length} movies to import`);
    
    // Clear existing movies
    console.log('🗑️ Clearing existing movies...');
    await Movie.deleteMany({});
    console.log('✅ Cleared existing movies');
    
    // Import movies
    if (movies.length > 0) {
      console.log('📥 Importing movies...');
      const result = await Movie.insertMany(movies);
      console.log(`✅ Imported ${result.length} movies successfully`);
    }
    
    // Verify import
    const count = await Movie.countDocuments();
    console.log(`📊 Total movies in database: ${count}`);
    
    // Check active movies
    const activeCount = await Movie.countDocuments({ status: 'active' });
    console.log(`🎬 Active movies: ${activeCount}`);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error importing movies:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

importMovies(); 