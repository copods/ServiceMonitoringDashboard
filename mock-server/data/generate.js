// Mock data generation script for the dashboard app
const fs = require('fs');
const path = require('path');

// Helper function to generate random integer
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate domains
const generateDomains = () => {
  const domainNames = ['Domain Enterprise', 'Domain name text', 'Domain 3', 'Domain 1'];
  const colorCodes = ['#3498db', '#2ecc71', '#9b59b6', '#e74c3c'];
  
  return domainNames.map((name, index) => {
    const id = (index + 1).toString();
    const totalServices = [120, 430, 45, 84][index];
    const criticalServices = [12, 8, 32, 16][index];
    
    return {
      id,
      name,
      totalServices,
      criticalServices,
      colorCode: colorCodes[index]
    };
  });
};

// Generate services
const generateServices = (domains) => {
  const services = [];
  let serviceId = 1;
  
  domains.forEach(domain => {
    // Generate a small subset of services for testing
    // In a real scenario, we'd generate all services
    const serviceCount = Math.min(domain.totalServices, 20);
    
    for (let i = 0; i < serviceCount; i++) {
      // Determine status based on domain's critical services ratio
      const criticalProbability = domain.criticalServices / domain.totalServices;
      const warningProbability = criticalProbability * 1.5;
      
      const random = Math.random();
      let status = 'normal';
      
      if (random < criticalProbability) {
        status = 'critical';
      } else if (random < criticalProbability + warningProbability) {
        status = 'warning';
      }
      
      // Generate criticality percentage
      const criticalityPercentage = status === 'critical' 
        ? randomInt(60, 95)
        : status === 'warning'
          ? randomInt(30, 59)
          : randomInt(1, 29);
      
      // Generate total requests (higher for more critical services)
      const baseRequests = status === 'critical' 
        ? randomInt(50000, 200000)
        : status === 'warning'
          ? randomInt(10000, 49999)
          : randomInt(1000, 9999);
          
      const totalRequests = Math.floor(baseRequests);
      
      // Calculate failed requests based on criticality
      const failedRequests = Math.floor(totalRequests * (criticalityPercentage / 100));
      
      // Generate hourly data for 24 hours
      const hourlyData = [];
      for (let hour = 0; hour < 24; hour++) {
        const hourlyTotal = Math.floor(totalRequests / 24 * (0.5 + Math.random()));
        const hourlyFailed = status === 'normal'
          ? Math.floor(hourlyTotal * (randomInt(1, 5) / 100))
          : status === 'warning'
            ? Math.floor(hourlyTotal * (randomInt(5, 30) / 100))
            : Math.floor(hourlyTotal * (randomInt(30, 95) / 100));
            
        hourlyData.push({
          hour,
          totalRequests: hourlyTotal,
          failedRequests: hourlyFailed,
          timestamp: new Date(2014, 4, 22, hour).toISOString()
        });
      }
      
      // Generate importance value (0-100)
      // Critical services tend to be more important
      const importanceBase = status === 'critical' ? 50 : status === 'warning' ? 30 : 10;
      const importance = Math.min(100, importanceBase + randomInt(0, 50));
      
      // Generate alerts
      const alerts = status === 'critical'
        ? randomInt(15, 40)
        : status === 'warning'
          ? randomInt(5, 15)
          : randomInt(0, 5);
          
      const criticalAlerts = status === 'critical'
        ? randomInt(alerts * 0.5, alerts)
        : status === 'warning'
          ? randomInt(1, alerts * 0.3)
          : randomInt(0, Math.min(2, alerts));
      
      services.push({
        id: serviceId.toString(),
        name: `Service ${status === 'critical' ? 'Critical' : ''} ${serviceId}`,
        domainId: domain.id,
        status,
        criticalityPercentage,
        totalRequests,
        failedRequests,
        alerts,
        criticalAlerts,
        importance,
        hourlyData
      });
      
      serviceId++;
    }
  });
  
  return services;
};

// Generate mock data and save to file
const generateMockData = () => {
  const domains = generateDomains();
  const services = generateServices(domains);
  
  const mockData = {
    domains,
    services
  };
  
  // Ensure directory exists
  const dbDir = path.join(__dirname, '..');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'db.json'),
    JSON.stringify(mockData, null, 2)
  );
  
  console.log('Mock data generated successfully!');
  console.log(`Generated ${domains.length} domains and ${services.length} services.`);
};

generateMockData();
