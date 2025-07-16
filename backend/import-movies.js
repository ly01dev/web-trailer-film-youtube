const fs = require('fs');
const mongoose = require('mongoose');

// Import Movie model
const Movie = require('./models/Movie');

async function importMovies() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://admin:password123@mongodb:27017/phim-youtube?authSource=admin');
    console.log('✅ Connected to MongoDB');
    
    // Read movies data from JSON file
    const moviesData = JSON.parse(fs.readFileSync('./movies.json', 'utf8'));
    const movies = moviesData.data;
    
    console.log(`📦 Found ${movies.length} movies to import`);
    
    // Clear existing movies
    await Movie.deleteMany({});
    console.log('🗑️ Cleared existing movies');
    
    // Import movies
    if (movies.length > 0) {
      const result = await Movie.insertMany(movies);
      console.log(`✅ Imported ${result.length} movies successfully`);
    }
    
    // Verify import
    const count = await Movie.countDocuments();
    console.log(`📊 Total movies in database: ${count}`);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error importing movies:', error.message);
    process.exit(1);
  }
}

importMovies(); 