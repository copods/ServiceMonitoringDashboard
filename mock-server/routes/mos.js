const express = require('express');
const path = require('path');
const { getMOSData } = require('../utils');
const router = express.Router();
const dataPath = path.join(__dirname, '..', 'data/mos-data.json');


// Endpoint for MOS dashboard overview data
router.get('/dashboard', (req, res) => {
  const data = getMOSData(dataPath);
  
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
  const data = getMOSData(dataPath);
  const routeId = req.params.routeId;
  
  if (data.routeDetails && data.routeDetails[routeId]) {
    res.json(data.routeDetails[routeId]);
  } else {
    res.status(404).json({ error: `Route ${routeId} not found` });
  }
});

// Endpoint for historical data
router.get('/historical', (req, res) => {
  const data = getMOSData(dataPath);
  
  if (data.historicalData) {
    res.json(data.historicalData);
  } else {
    res.status(404).json({ error: 'Historical data not found' });
  }
});

module.exports = router;
