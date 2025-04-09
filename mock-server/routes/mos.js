const express = require('express');
const path = require('path');
const { getMOSData } = require('../utils');
const router = express.Router();
const dataPath = path.join(__dirname, '..', 'data/mos-data.json');


// Endpoint for MOS dashboard overview data
router.get('/dashboard', (req, res) => {
  const data = getMOSData(dataPath);
  // Read sourceId from query, default to 'denver'
  const sourceId = req.query.sourceId || 'denver';

  // Filter routes based on sourceId
  const filteredRoutes = data.routes.filter(route => route.sourceId === sourceId);

  // Update issue details based on the selected source
  const sourceLocation = data.locations.find(loc => loc.id === sourceId);
  let issueDetails = { ...data.issueDetails }; // Clone original details
  if (sourceLocation) {
    issueDetails.mainNode = sourceLocation.name;
  } else {
    console.warn(`Source location with ID ${sourceId} not found in mock data.`);
  }

  // Return the essential data needed for dashboard overview, with filtered routes and updated details
  res.json({
    serviceInfo: data.serviceInfo,
    issueDetails: issueDetails, // Use updated details
    locations: data.locations,
    routes: filteredRoutes, // Use filtered routes
    // Don't include route-specific historical data in initial response
    historicalData: data.historicalData // Keep the generic historical data for backward compatibility
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

// Update the historical data endpoint to accept routeId parameter
router.get('/historical', (req, res) => {
  const data = getMOSData(dataPath);
  // Read sourceId and routeId from query
  const sourceId = req.query.sourceId || 'denver';
  const routeId = req.query.routeId;

  if (!routeId) {
    return res.status(400).json({ error: 'Route ID is required for historical data' });
  }

  // Check if we have historical data for the requested route
  if (data.routeHistoricalData && data.routeHistoricalData[routeId]) {
    return res.json(data.routeHistoricalData[routeId]);
  }

  // Fallback to generic data if route-specific data is not found
  if (data.historicalData) {
    console.warn(`No specific historical data found for route ${routeId}, using fallback data`);
    return res.json(data.historicalData);
  }

  res.status(404).json({ error: 'Historical data not found' });
});

module.exports = router;
