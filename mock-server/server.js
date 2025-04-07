// mock-server/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const networkRoutes = require('./routes/network');
const fs = require('fs');

// Create Express app
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Network routes for MOS Dashboard
app.use('/api/network', networkRoutes);

// Simple endpoint for regular services data - fallback if json-server isn't working
app.get('/services', (req, res) => {
  try {
    const dbPath = path.join(__dirname, 'db.json');
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      res.json(data.services || []);
    } else {
      res.status(404).json({ error: 'Services data not found' });
    }
  } catch (error) {
    console.error('Error reading services data:', error);
    res.status(500).json({ error: 'Failed to read services data' });
  }
});

// Simple endpoint for domains data - fallback if json-server isn't working
app.get('/domains', (req, res) => {
  try {
    const dbPath = path.join(__dirname, 'db.json');
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      res.json(data.domains || []);
    } else {
      res.status(404).json({ error: 'Domains data not found' });
    }
  } catch (error) {
    console.error('Error reading domains data:', error);
    res.status(500).json({ error: 'Failed to read domains data' });
  }
});

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