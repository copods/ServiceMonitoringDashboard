const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Helper functions
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Function to generate importance updates for eligible services
const generateImportanceUpdate = (services) => {
  // Find eligible services (normal status, totalRequests < 500)
  const eligibleServices = services.filter(service => 
    service.status === 'normal' && service.totalRequests < 500
  );
  
  if (eligibleServices.length === 0) return null;
  
  // Randomly select a service
  const selectedService = eligibleServices[Math.floor(Math.random() * eligibleServices.length)];
  
  // Decide whether to increase or decrease importance (50/50 chance)
  const isIncreasing = Math.random() > 0.5;
  
  // Calculate new importance value (change by 20-30 points for significant movement)
  const changeAmount = Math.floor(Math.random() * 10) + 20;
  const previousImportance = selectedService.importance;
  const newImportance = isIncreasing 
    ? Math.min(100, previousImportance + changeAmount)
    : Math.max(5, previousImportance - changeAmount);
  
  // Don't update if we've reached limits
  if (newImportance === previousImportance) return null;
  
  // Update the local service data
  selectedService.importance = newImportance;
  
  // If importance is increasing to above 75%, ensure totalRequests and failedRequests are capped at 11,000
  if (isIncreasing && newImportance > 75 && previousImportance <= 75) {
    // Check total and failed requests Math.max(10, previousImportance - changeAmount) adjust if needed
    if (selectedService.totalRequests > 11000) {
      selectedService.totalRequests = randomInt(9000, 11000);
    }
    
    if (selectedService.failedRequests > 11000) {
      selectedService.failedRequests = randomInt(1000, 11000);
    }
    
    // Also adjust hourly data to be consistent
    selectedService.hourlyData.forEach(hourData => {
      if (hourData.totalRequests > 11000 / 24) {
        hourData.totalRequests = randomInt(300, 450); // ~11000/24
      }
      if (hourData.failedRequests > 11000 / 24) {
        hourData.failedRequests = randomInt(100, 450); // ~11000/24
      }
    });
  }
  
  return {
    id: selectedService.id,
    importance: newImportance,
    previousImportance,
    isIncreasing
  };
};

// Create WebSocket server
const startWebSocketServer = () => {
  // Load mock data
  const mockDataPath = path.join(__dirname, 'db.json');
  let mockData;
  
  try {
    if (fs.existsSync(mockDataPath)) {
      mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
    } else {
      console.error('Mock data file not found. Please run generate.js first.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Failed to load mock data:', error);
    process.exit(1);
  }
  
  const services = mockData.services;
  
  // Create WebSocket server on port 3002
  const wss = new WebSocket.Server({ port: 3002 });
  
  console.log('WebSocket server running on port 3002');
  
  // Handle connections
  wss.on('connection', (ws) => {
    console.log('Client connected');
    
    // Send initial data
    ws.send(JSON.stringify({
      type: 'INITIAL_DATA',
      payload: {
        services: services.slice(0, 10) // Send a subset of services for demo
      }
    }));
    
    // Set up interval to send random updates
    const intervalId = setInterval(() => {
      // Only send updates if connection is still open
      if (ws.readyState === WebSocket.OPEN) {
        // 25% chance to send an importance update instead of regular update
        if (Math.random() < 0.25) {
          const importanceUpdate = generateImportanceUpdate(services);
          
          if (importanceUpdate) {
            ws.send(JSON.stringify({
              type: 'SERVICE_IMPORTANCE_UPDATE',
              payload: importanceUpdate
            }));
          } else {
            // Fall back to regular update if no eligible services
            sendRegularUpdate();
          }
        } else {
          sendRegularUpdate();
        }
      }
    }, 3000); // Send an update every 3 seconds
    
    // Helper function for regular service updates
    function sendRegularUpdate() {
      // Generate a random service update
      const randomServiceIndex = randomInt(0, services.length - 1);
      const service = services[randomServiceIndex];
      
      // Update a random hourly data point
      const randomHour = randomInt(0, 23);
      const hourlyData = [...service.hourlyData];
      
      // Get the service's importance
      const serviceImportance = service.importance;
      
      // Increase or decrease requests randomly
      const requestChange = randomInt(-50, 100);
      hourlyData[randomHour].totalRequests += requestChange;
      
      // Ensure totalRequests is not negative
      hourlyData[randomHour].totalRequests = Math.max(0, hourlyData[randomHour].totalRequests);
      
      // For high importance services (>75), cap totalRequests at 11,000
      if (serviceImportance > 75 && hourlyData[randomHour].totalRequests > 11000) {
        hourlyData[randomHour].totalRequests = randomInt(9000, 11000);
      }
      
      // Update failed requests proportionally
      const failedRequestsPercentage = service.criticalityPercentage / 100;
      hourlyData[randomHour].failedRequests = Math.floor(
        hourlyData[randomHour].totalRequests * failedRequestsPercentage
      );
      
      // For high importance services (>75), cap failedRequests at 11,000
      if (serviceImportance > 75 && hourlyData[randomHour].failedRequests > 11000) {
        hourlyData[randomHour].failedRequests = randomInt(9000, 11000);
      }
      
      // Create service update
      const serviceUpdate = {
        id: service.id,
        hourlyData: [hourlyData[randomHour]]
      };
      
      // Send update
      ws.send(JSON.stringify({
        type: 'SERVICE_UPDATE',
        payload: serviceUpdate
      }));
    }
    
    // Clean up on connection close
    ws.on('close', () => {
      console.log('Client disconnected');
      clearInterval(intervalId);
    });
  });
  
  return wss;
};

// If this script is run directly, start the WebSocket server
if (require.main === module) {
  startWebSocketServer();
}

module.exports = { startWebSocketServer };
