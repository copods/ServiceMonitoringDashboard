// mock-server/server.js
const express = require('express');
const cors = require('cors');
const networkRoutes = require('./routes/network');
const monitorRoutes = require('./routes/monitor'); // Added monitor routes

// Create Express app
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Network routes for MOS Dashboard
app.use('/api/network', networkRoutes);

// monitor routes (includes services and domains)
app.use('/api/monitor', monitorRoutes);

// Handle WebSocket server conditionally
let websocketServer;
try {
  websocketServer = require('./websocket');
  console.log('WebSocket module loaded successfully');
} catch (error) {
  console.log('WebSocket module not available:', error.message);
  websocketServer = null;
}

// Start the server
const server = app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
  
  // Initialize WebSocket server if available
  if (websocketServer && typeof websocketServer.startWebSocketServer === 'function') {
    try {
      websocketServer.startWebSocketServer(server);
    } catch (error) {
      console.error('Failed to start WebSocket server:', error);
    }
  }
});
