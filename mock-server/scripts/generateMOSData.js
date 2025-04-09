// Generate MOS Dashboard mock data
const fs = require('fs');
const path = require('path');

// Helper to generate a random number within a range
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(1));

// Simple pseudo-random number generator (PRNG) using mulberry32 algorithm
// Needed for consistent random data based on route ID seed
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Generate MOS dashboard data based on specification
const generateMOSData = () => {
  // Define all locations
  const locations = [
    { id: "denver", name: "Denver", coordinates: { x: 450, y: 300 } },
    { id: "pune", name: "Pune", coordinates: { x: 750, y: 200 } },
    { id: "berlin", name: "Berlin", coordinates: { x: 650, y: 150 } },
    { id: "newYork", name: "New York", coordinates: { x: 550, y: 250 } },
    { id: "bangalore", name: "Bangalore", coordinates: { x: 700, y: 350 } },
    { id: "california", name: "California", coordinates: { x: 350, y: 320 } },
    { id: "seattle", name: "Seattle", coordinates: { x: 300, y: 200 } },
    { id: "mumbai", name: "Mumbai", coordinates: { x: 750, y: 300 } }
  ];

  // Create a map for easy name lookup
  const locationMap = locations.reduce((acc, loc) => {
    acc[loc.id] = loc;
    return acc;
  }, {});

  // Create routes between all locations (excluding self-routes)
  const routes = [];
  locations.forEach(source => {
    locations.forEach(destination => {
      if (source.id === destination.id) return; // Skip route to self

      const routeId = `${source.id}-${destination.id}`;
      const streamCount = getRandomInt(10000, 55000);
      // Make MOS generally lower for longer distances (simple heuristic)
      const isIntercontinental = (['denver', 'newYork', 'california', 'seattle'].includes(source.id) && ['pune', 'berlin', 'bangalore', 'mumbai'].includes(destination.id)) ||
                                 (['pune', 'berlin', 'bangalore', 'mumbai'].includes(source.id) && ['denver', 'newYork', 'california', 'seattle'].includes(destination.id));
      const mosPercentage = isIntercontinental ? getRandomInt(30, 55) : getRandomInt(40, 70);
      const packetLossPercentage = getRandomFloat(40, 70); // Higher packet loss generally
      const impactPercentage = getRandomInt(60, 95); // High impact

      routes.push({
        id: routeId,
        sourceId: source.id,
        destinationId: destination.id,
        streamCount,
        mosPercentage,
        packetLossPercentage,
        impactPercentage
      });
    });
  });

  // Create route details objects for all generated routes
  const routeDetails = {};
  // Create a map to store route-specific historical data
  const routeHistoricalData = {};

  routes.forEach(route => {
    const sourceName = locationMap[route.sourceId]?.name || route.sourceId;
    const destinationName = locationMap[route.destinationId]?.name || route.destinationId;

    routeDetails[route.id] = {
      id: route.id,
      sourceId: route.sourceId,
      destinationId: route.destinationId,
      forwardPath: {
        mosPercentage: route.mosPercentage,
        packetLossPercentage: parseFloat(route.packetLossPercentage), // Ensure float
        streamCount: route.streamCount,
        impactPercentage: route.impactPercentage
      },
      returnPath: { // Random return path data
        mosPercentage: getRandomInt(50, 95),
        streamCount: Math.floor(route.streamCount * getRandomFloat(0.1, 0.4)), // Fewer return streams
        impactPercentage: getRandomInt(30, 60)
      },
      analysis: {
        impactedStreamsPercentage: getRandomInt(60, 95),
        sourceToDestPercentage: getRandomInt(5, 20), // Random overlap percentage
        overlapAnalysis: `It's inconclusive whether the streams impacted from ${sourceName} are the same streams impacted at ${destinationName}.`
      },
      additionalStats: { // Random additional stats
        sourceMOS: getRandomFloat(40, 65),
        sourcePacketLoss: getRandomFloat(30, 60),
        destinationMOS: getRandomFloat(40, 65),
        destinationPacketLoss: getRandomFloat(10, 40)
      }
    };

    // Generate unique historical data for each route
    routeHistoricalData[route.id] = generateHistoricalDataForRoute(route.id, route.sourceId, route.destinationId);
  });

  // Generate historical data (sample for overtime view - generic fallback)
  const historicalData = [
    { month: "Apr", ingressValue: 120, egressValue: 150 },
    { month: "May", ingressValue: 130, egressValue: 155 },
    { month: "Jun", ingressValue: 125, egressValue: 145 },
    { month: "Jul", ingressValue: 140, egressValue: 160 },
    { month: "Aug", ingressValue: 135, egressValue: 150 },
    { month: "Sep", ingressValue: 150, egressValue: 165 },
    { month: "Oct", ingressValue: 145, egressValue: 155 },
    { month: "Nov", ingressValue: 130, egressValue: 140 },
    { month: "Dec", ingressValue: 110, egressValue: 120 },
    { month: "Jan", ingressValue: 100, egressValue: 105 }
  ];

  // Create dashboard data object
  const mosDashboardData = {
    serviceInfo: {
      id: "web-service-2",
      name: "Web Service 2",
      currentTime: "08/12/14 at 07:30 pm IST", // Keep static for mock
      startTime: "08/12/14 at 06:30 pm IST" // Keep static for mock
    },
    issueDetails: { // Default details, API handler will override mainNode based on sourceId
      mainNode: "Denver",
      degradationPercentage: 56.9, // Keep default degradation static for now
      application: "Audio",
      vlan: "Unknown",
      codec: "G.729"
    },
    locations,
    routes, // Use the newly generated routes
    routeDetails, // Use the newly generated details
    historicalData, // Keep for backward compatibility
    routeHistoricalData // Add the route-specific historical data
  };

  return mosDashboardData;
};

// New helper function to generate unique historical data for each route
const generateHistoricalDataForRoute = (routeId, sourceId, destinationId) => {
  // Use route components to seed random values for consistency
  const seed = routeId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const random = mulberry32(seed);

  // Base pattern that will be unique per route due to the seed
  const baseValue = 80 + random() * 70;
  const volatility = 10 + random() * 30;

  return [
    { month: "Apr", ingressValue: Math.round(baseValue + (random() - 0.5) * volatility), egressValue: Math.round(baseValue * 1.1 + (random() - 0.5) * volatility) },
    { month: "May", ingressValue: Math.round(baseValue + (random() - 0.5) * volatility), egressValue: Math.round(baseValue * 1.1 + (random() - 0.5) * volatility) },
    { month: "Jun", ingressValue: Math.round(baseValue + (random() - 0.5) * volatility), egressValue: Math.round(baseValue * 1.1 + (random() - 0.5) * volatility) },
    { month: "Jul", ingressValue: Math.round(baseValue + (random() - 0.5) * volatility), egressValue: Math.round(baseValue * 1.1 + (random() - 0.5) * volatility) },
    { month: "Aug", ingressValue: Math.round(baseValue + (random() - 0.5) * volatility), egressValue: Math.round(baseValue * 1.1 + (random() - 0.5) * volatility) },
    { month: "Sep", ingressValue: Math.round(baseValue + (random() - 0.5) * volatility), egressValue: Math.round(baseValue * 1.1 + (random() - 0.5) * volatility) },
    { month: "Oct", ingressValue: Math.round(baseValue + (random() - 0.5) * volatility), egressValue: Math.round(baseValue * 1.1 + (random() - 0.5) * volatility) },
    { month: "Nov", ingressValue: Math.round(baseValue + (random() - 0.5) * volatility), egressValue: Math.round(baseValue * 1.1 + (random() - 0.5) * volatility) },
    { month: "Dec", ingressValue: Math.round(baseValue + (random() - 0.5) * volatility), egressValue: Math.round(baseValue * 1.1 + (random() - 0.5) * volatility) },
    { month: "Jan", ingressValue: Math.round(baseValue + (random() - 0.5) * volatility), egressValue: Math.round(baseValue * 1.1 + (random() - 0.5) * volatility) }
  ];
};

// Write data to file
const saveMOSData = () => {
  const mosData = generateMOSData();

  // Ensure directory exists
  const dataDir = path.join(__dirname, "..", "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(dataDir, "mos-data.json"),
    JSON.stringify(mosData, null, 2)
  );

  console.log("MOS Dashboard data generated successfully with route-specific historical data!");
};

// Execute the function to save the data
saveMOSData();
