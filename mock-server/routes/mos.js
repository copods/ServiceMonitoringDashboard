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
    // Note: Degradation percentage could also be made source-specific if needed
    // issueDetails.degradationPercentage = generateDegradationForSource(sourceId); 
  } else {
    // Handle case where sourceId might be invalid, fallback or error?
    console.warn(`Source location with ID ${sourceId} not found in mock data.`);
    // Keep default mainNode or set to something indicative?
  }
  
  // Return the essential data needed for dashboard overview, with filtered routes and updated details
  res.json({
    serviceInfo: data.serviceInfo,
    issueDetails: issueDetails, // Use updated details
    locations: data.locations,
    routes: filteredRoutes // Use filtered routes
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
  // Read sourceId from query, default to 'denver'
  const sourceId = req.query.sourceId || 'denver'; 
  
  // Note: Currently, mock historical data is not source-specific.
  // Returning the same data regardless of sourceId.
  // This could be enhanced later if needed.
  console.log(`Fetching historical data (mock, sourceId: ${sourceId} ignored)`);

  if (data.historicalData) {
    res.json(data.historicalData);
  } else {
    res.status(404).json({ error: 'Historical data not found' });
  }
});

module.exports = router;
