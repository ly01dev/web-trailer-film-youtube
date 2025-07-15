const express = require('express');
const app = express();

// Middleware cơ bản
app.use(express.json());

// Test routes
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Test server works!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API test works!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Test: http://localhost:${PORT}/api/test`);
}); 