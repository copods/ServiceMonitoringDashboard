const express = require('express');
const path = require('path');
const { getmonitorData } = require('../utils');


const router = express.Router();
const dataPath = path.join(__dirname, '..', 'data/monitor-data.json');

// Simple endpoint for regular services data - fallback if json-server isn't working
router.get('/services', (req, res) => {
  const data = getmonitorData(dataPath);
  res.json(data.services || []);
});

// Simple endpoint for domains data - fallback if json-server isn't working
router.get('/domains', (req, res) => {
  const data = getmonitorData(dataPath);
  res.json(data.domains || []);
});

module.exports = router;
