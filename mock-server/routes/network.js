// mock-server/routes/network.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dataPath = path.join(__dirname, '..', 'network-data.json');

// Load data
const getData = () => {
  try {
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Error reading network data file:", error);
    // Return default structure if file doesn't exist or is invalid
    return { locations: [], routes: [], statistics: {} }; 
  }
};

// GET all locations
router.get('/locations', (req, res) => {
  const data = getData();
  res.json(data.locations || []);
});

// GET all routes
router.get('/routes', (req, res) => {
  const data = getData();
  res.json(data.routes || []);
});

// GET statistics for a specific route
router.get('/statistics', (req, res) => {
  const { sourceId, destinationId } = req.query;
  if (!sourceId || !destinationId) {
    return res.status(400).json({ error: 'sourceId and destinationId query parameters are required' });
  }
  
  const data = getData();
  const routeId = `${sourceId}-${destinationId}`;
  const statistics = data.statistics ? (data.statistics[routeId] || []) : [];
  
  res.json(statistics);
});

module.exports = router;
