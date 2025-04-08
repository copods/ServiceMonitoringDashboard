const express = require('express');
const path = require('path');
const { getNetworkData } = require('../utils');
const router = express.Router();
const dataPath = path.join(__dirname, '..', 'data/network-data.json');


// GET all locations
router.get('/locations', (req, res) => {
  const data = getNetworkData(dataPath);
  res.json(data.locations || []);
});

// GET all routes
router.get('/routes', (req, res) => {
  const data = getNetworkData(dataPath);
  res.json(data.routes || []);
});

// GET statistics for a specific route
router.get('/statistics', (req, res) => {
  const { sourceId, destinationId } = req.query;
  if (!sourceId || !destinationId) {
    return res.status(400).json({ error: 'sourceId and destinationId query parameters are required' });
  }
  
  const data = getNetworkData(dataPath);
  const routeId = `${sourceId}-${destinationId}`;
  const statistics = data.statistics ? (data.statistics[routeId] || []) : [];
  
  res.json(statistics);
});

module.exports = router;
