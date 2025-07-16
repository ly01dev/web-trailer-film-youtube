const { MongoClient } = require('mongodb');
const fs = require('fs');

// MongoDB connection string
const uri = 'mongodb://admin:password123@localhost:27017/phim-youtube?authSource=admin';

async function importMovies() {
  try {
    // Connect to MongoDB
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('phim-youtube');
    const moviesCollection = db.collection('movies');

    // Read movies data from JSON file
    const moviesData = JSON.parse(fs.readFileSync('./movies.json', 'utf8'));
    const movies = moviesData.data;

    console.log(`📦 Found ${movies.length} movies to import`);

    // Clear existing movies
    await moviesCollection.deleteMany({});
    console.log('🗑️ Cleared existing movies');

    // Import movies
    if (movies.length > 0) {
      const result = await moviesCollection.insertMany(movies);
      console.log(`✅ Imported ${result.insertedCount} movies successfully`);
    }

    // Verify import
    const count = await moviesCollection.countDocuments();
    console.log(`📊 Total movies in database: ${count}`);

    await client.close();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error importing movies:', error);
    process.exit(1);
  }
}

importMovies(); 