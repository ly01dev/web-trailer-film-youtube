/**
 * Database Connection Utility
 * Kết nối đến MongoDB database với error handling và logging
 */

const mongoose = require('mongoose');

/**
 * Hàm kết nối đến MongoDB database
 * Sử dụng MONGO_URI từ file .env hoặc fallback về local MongoDB
 * @returns {Promise<void>} - Promise khi kết nối thành công
 */
const connectDB = async () => {
  try {
    // Lấy URI kết nối từ biến môi trường, ưu tiên MONGO_URI trước
    const mongoURI = process.env.MONGO_URI || 
                     process.env.MONGODB_URI || 
                     'mongodb://localhost:27017/movietube';
    
    // Kết nối đến MongoDB với các options tối ưu
    const conn = await mongoose.connect(mongoURI, {
      maxPoolSize: 10,            // Số lượng connection tối đa trong pool
      serverSelectionTimeoutMS: 5000, // Timeout khi chọn server
      socketTimeoutMS: 45000,     // Timeout cho socket operations
      bufferCommands: false       // Disable mongoose buffering
    });

    // Log thành công khi kết nối được
    console.log(`📦 MongoDB đã kết nối thành công: ${conn.connection.host}`);
    console.log(`🔗 Database: ${conn.connection.name}`);
    console.log(`⚡ Mongoose version: ${mongoose.version}`);
  } catch (error) {
    // Log lỗi chi tiết khi không kết nối được
    console.error(`❌ Lỗi kết nối database: ${error.message}`);
    console.log('💡 Hãy đảm bảo:');
    console.log('   1. MongoDB đang chạy');
    console.log('   2. MONGO_URI được cấu hình trong file .env');
    console.log('   3. Network connection ổn định');
    
    // Thoát process nếu không kết nối được database
    process.exit(1);
  }
};

/**
 * Hàm đóng kết nối database
 * Dùng khi cần graceful shutdown
 * @returns {Promise<void>} - Promise khi đóng thành công
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection đã đóng');
  } catch (error) {
    console.error('❌ Lỗi khi đóng MongoDB connection:', error.message);
  }
};

/**
 * Event listeners cho database connection
 */
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB connection bị ngắt');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB connection đã kết nối lại');
});

// Graceful shutdown khi app tắt
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

module.exports = { connectDB, disconnectDB }; 