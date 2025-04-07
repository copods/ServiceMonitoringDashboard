// mock-server/data/generateNetworkData.js
const fs = require('fs');
const path = require('path');

// Helper function to generate random integer
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateNetworkData = () => {
  // Generate locations
  const locations = [
    { id: 'denver', name: 'Denver', code: 'DEN', type: 'ingress' },
    { id: 'pune', name: 'Pune', code: 'PNQ', type: 'egress' },
    { id: 'berlin', name: 'Berlin', code: 'BER', type: 'egress' },
    { id: 'newyork', name: 'Newyork', code: 'NYC', type: 'egress' },
    { id: 'bangalore', name: 'Bangalore', code: 'BLR', type: 'egress' },
    { id: 'california', name: 'California', code: 'CAL', type: 'egress' },
    { id: 'seattle', name: 'Seattle', code: 'SEA', type: 'egress' },
    { id: 'mumbai', name: 'Mumbai', code: 'BOM', type: 'egress' }
  ];

  // Generate routes from Denver to all egress locations
  const routes = [];
  const egressLocations = locations.filter(loc => loc.type === 'egress');
  
  // Denver's base MOS degradation
  const denverMos = 56.9;
  
  egressLocations.forEach(destination => {
    // Generate forward route (Denver to destination)
    const streamVolume = randomInt(20, 90);
    const impactedPercentage = destination.name === 'Seattle' ? 15 : randomInt(40, 96);
    const degradationPercentage = randomInt(10, 90);
    const packetLoss = randomInt(20, 65);
    
    routes.push({
      id: `denver-${destination.id}`,
      sourceId: 'denver',
      destinationId: destination.id,
      totalStreams: streamVolume * 1000,
      impactedPercentage,
      mosScore: Math.min(100, Math.max(0, randomInt(20, 90))),
      packetLoss,
      degradationPercentage
    });
    
    // Generate reverse route (destination to Denver) with lower volume
    routes.push({
      id: `${destination.id}-denver`,
      sourceId: destination.id,
      destinationId: 'denver',
      totalStreams: Math.floor(streamVolume * 1000 * 0.2), // 20% of forward traffic
      impactedPercentage: randomInt(30, 70),
      mosScore: Math.min(100, Math.max(0, randomInt(30, 70))),
      packetLoss: randomInt(10, 40),
      degradationPercentage: randomInt(10, 60)
    });
  });
  
  // Generate monthly statistics for routes
  const months = ['April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
  const routeStatistics = {};
  
  routes.forEach(route => {
    const stats = months.map((month, index) => {
      // Create a decline pattern for Denver-Pune route in later months
      let value = randomInt(50, 100);
      if (route.id === 'denver-pune' && index > 6) {
        value = Math.max(10, value - (index - 6) * 20);
      }
      
      return {
        month,
        value,
        date: `2014-${String((index + 4) % 12 + 1).padStart(2, '0')}-01` // Ensure month is two digits
      };
    });
    
    routeStatistics[route.id] = stats;
  });
  
  // Save generated data
  const networkData = {
    locations,
    routes,
    statistics: routeStatistics
  };
  
  const outputDir = path.join(__dirname, '..'); // Save to mock-server directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(outputDir, 'network-data.json'),
    JSON.stringify(networkData, null, 2)
  );
  
  console.log('Network data generated successfully!');
};

generateNetworkData();
