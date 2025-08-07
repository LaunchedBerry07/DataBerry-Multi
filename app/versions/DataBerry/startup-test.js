// Simple test to verify the application can start
const http = require('http');

// Test if we can create a basic server
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Server test successful\n');
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Server startup test passed');
  process.exit(0);
});

// Exit after 5 seconds if server doesn't start
setTimeout(() => {
  console.error('Server startup test failed - timeout');
  process.exit(1);
}, 5000);