const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const dataPath = path.join(__dirname, '..', 'data/mos-data.json');

// Helper function to get MOS data
const getMOSData = () => {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading MOS data:', error);
    return {};
  }
};

// Endpoint for MOS dashboard overview data
router.get('/dashboard', (req, res) => {
  const data = getMOSData();
  
  // Return the essential data needed for dashboard overview
  res.json({
    serviceInfo: data.serviceInfo,
    issueDetails: data.issueDetails,
    locations: data.locations,
    routes: data.routes
  });
});

// Endpoint for getting route details
router.get('/route/:routeId', (req, res) => {
  const data = getMOSData();
  const routeId = req.params.routeId;
  
  if (data.routeDetails && data.routeDetails[routeId]) {
    res.json(data.routeDetails[routeId]);
  } else {
    res.status(404).json({ error: `Route ${routeId} not found` });
  }
});

// Endpoint for historical data
router.get('/historical', (req, res) => {
  const data = getMOSData();
  
  if (data.historicalData) {
    res.json(data.historicalData);
  } else {
    res.status(404).json({ error: 'Historical data not found' });
  }
});

module.exports = router;
