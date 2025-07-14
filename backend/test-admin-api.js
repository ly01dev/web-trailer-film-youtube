const axios = require('axios');

// Test API admin
async function testAdminAPI() {
  try {
    console.log('Testing admin API...');
    
    // Test 1: Get all users (without token - should fail)
    console.log('\n1. Testing GET /api/auth/admin/users (no token):');
    try {
      const response = await axios.get('http://localhost:5000/api/auth/admin/users');
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.log('❌ Expected error:', error.response?.data || error.message);
    }
    
    // Test 2: Check if server is running
    console.log('\n2. Testing health check:');
    try {
      const response = await axios.get('http://localhost:5000/health');
      console.log('✅ Server is running:', response.data);
    } catch (error) {
      console.log('❌ Server error:', error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAdminAPI(); 