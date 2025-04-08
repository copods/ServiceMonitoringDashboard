// Generate MOS Dashboard mock data
const fs = require('fs');
const path = require('path');

// Generate MOS dashboard data based on specification
const generateMOSData = () => {
  const denverLocation = { id: "denver", name: "Denver", coordinates: { x: 450, y: 300 } };
  
  const destinations = [
    { id: "pune", name: "Pune", coordinates: { x: 750, y: 200 } },
    { id: "berlin", name: "Berlin", coordinates: { x: 650, y: 150 } },
    { id: "newYork", name: "New York", coordinates: { x: 550, y: 250 } },
    { id: "bangalore", name: "Bangalore", coordinates: { x: 700, y: 350 } },
    { id: "california", name: "California", coordinates: { x: 350, y: 320 } },
    { id: "seattle", name: "Seattle", coordinates: { x: 300, y: 200 } },
    { id: "mumbai", name: "Mumbai", coordinates: { x: 750, y: 300 } }
  ];
  
  // Create all locations including Denver
  const locations = [denverLocation, ...destinations];
  
  // Create routes from Denver to each destination
  const routes = destinations.map(destination => {
    const streamCounts = {
      "pune": 50000,
      "berlin": 42000,
      "newYork": 36000,
      "bangalore": 28000,
      "california": 45000,
      "seattle": 30000,
      "mumbai": 38000
    };
    
    const mosPercentages = {
      "pune": 37,
      "berlin": 42,
      "newYork": 45,
      "bangalore": 38,
      "california": 48,
      "seattle": 52,
      "mumbai": 40
    };
    
    const packetLossPercentages = {
      "pune": 64.9,
      "berlin": 58.2,
      "newYork": 52.7,
      "bangalore": 61.5,
      "california": 49.8,
      "seattle": 45.3,
      "mumbai": 59.4
    };
    
    const impactPercentages = {
      "pune": 90,
      "berlin": 80,
      "newYork": 75,
      "bangalore": 85,
      "california": 70,
      "seattle": 65,
      "mumbai": 82
    };
    
    return {
      id: `denver-${destination.id}`,
      sourceId: denverLocation.id,
      destinationId: destination.id,
      streamCount: streamCounts[destination.id],
      mosPercentage: mosPercentages[destination.id],
      packetLossPercentage: packetLossPercentages[destination.id],
      impactPercentage: impactPercentages[destination.id]
    };
  });
  
  // Create route details objects
  const routeDetails = {};
  
  // Denver to Pune details
  routeDetails["denver-pune"] = {
    id: "denver-pune",
    sourceId: "denver",
    destinationId: "pune",
    forwardPath: {
      mosPercentage: 37,
      packetLossPercentage: 64.9,
      streamCount: 50000,
      impactPercentage: 95
    },
    returnPath: {
      mosPercentage: 90,
      streamCount: 8000,
      impactPercentage: 50
    },
    analysis: {
      impactedStreamsPercentage: 90,
      sourceToDestPercentage: 7,
      overlapAnalysis: "It's inconclusive whether the streams impacted from Denver are the same streams impacted at Pune."
    },
    additionalStats: {
      sourceMOS: 56.9,
      sourcePacketLoss: 55,
      destinationMOS: 54,
      destinationPacketLoss: 25
    }
  };
  
  // Denver to Berlin details
  routeDetails["denver-berlin"] = {
    id: "denver-berlin",
    sourceId: "denver",
    destinationId: "berlin",
    forwardPath: {
      mosPercentage: 42,
      packetLossPercentage: 58.2,
      streamCount: 42000,
      impactPercentage: 85
    },
    returnPath: {
      mosPercentage: 85,
      streamCount: 7000,
      impactPercentage: 45
    },
    analysis: {
      impactedStreamsPercentage: 80,
      sourceToDestPercentage: 8,
      overlapAnalysis: "Analysis pending for Berlin route impact correlation."
    },
    additionalStats: {
      sourceMOS: 56.9,
      sourcePacketLoss: 55,
      destinationMOS: 48,
      destinationPacketLoss: 30
    }
  };
  
  // Denver to New York details
  routeDetails["denver-newYork"] = {
    id: "denver-newYork",
    sourceId: "denver",
    destinationId: "newYork",
    forwardPath: {
      mosPercentage: 45,
      packetLossPercentage: 52.7,
      streamCount: 36000,
      impactPercentage: 78
    },
    returnPath: {
      mosPercentage: 78,
      streamCount: 9000,
      impactPercentage: 42
    },
    analysis: {
      impactedStreamsPercentage: 75,
      sourceToDestPercentage: 12,
      overlapAnalysis: "Analysis pending for New York route impact correlation."
    },
    additionalStats: {
      sourceMOS: 56.9,
      sourcePacketLoss: 55,
      destinationMOS: 50,
      destinationPacketLoss: 28
    }
  };
  
  // Denver to Bangalore details
  routeDetails["denver-bangalore"] = {
    id: "denver-bangalore",
    sourceId: "denver",
    destinationId: "bangalore",
    forwardPath: {
      mosPercentage: 38,
      packetLossPercentage: 61.5,
      streamCount: 28000,
      impactPercentage: 88
    },
    returnPath: {
      mosPercentage: 82,
      streamCount: 5000,
      impactPercentage: 48
    },
    analysis: {
      impactedStreamsPercentage: 85,
      sourceToDestPercentage: 6,
      overlapAnalysis: "Analysis pending for Bangalore route impact correlation."
    },
    additionalStats: {
      sourceMOS: 56.9,
      sourcePacketLoss: 55,
      destinationMOS: 52,
      destinationPacketLoss: 32
    }
  };
  
  // Denver to California details
  routeDetails["denver-california"] = {
    id: "denver-california",
    sourceId: "denver",
    destinationId: "california",
    forwardPath: {
      mosPercentage: 48,
      packetLossPercentage: 49.8,
      streamCount: 45000,
      impactPercentage: 72
    },
    returnPath: {
      mosPercentage: 75,
      streamCount: 15000,
      impactPercentage: 38
    },
    analysis: {
      impactedStreamsPercentage: 70,
      sourceToDestPercentage: 15,
      overlapAnalysis: "Analysis pending for California route impact correlation."
    },
    additionalStats: {
      sourceMOS: 56.9,
      sourcePacketLoss: 55,
      destinationMOS: 58,
      destinationPacketLoss: 22
    }
  };
  
  // Denver to Seattle details
  routeDetails["denver-seattle"] = {
    id: "denver-seattle",
    sourceId: "denver",
    destinationId: "seattle",
    forwardPath: {
      mosPercentage: 52,
      packetLossPercentage: 45.3,
      streamCount: 30000,
      impactPercentage: 68
    },
    returnPath: {
      mosPercentage: 72,
      streamCount: 12000,
      impactPercentage: 35
    },
    analysis: {
      impactedStreamsPercentage: 65,
      sourceToDestPercentage: 18,
      overlapAnalysis: "Analysis pending for Seattle route impact correlation."
    },
    additionalStats: {
      sourceMOS: 56.9,
      sourcePacketLoss: 55,
      destinationMOS: 62,
      destinationPacketLoss: 20
    }
  };
  
  // Denver to Mumbai details
  routeDetails["denver-mumbai"] = {
    id: "denver-mumbai",
    sourceId: "denver",
    destinationId: "mumbai",
    forwardPath: {
      mosPercentage: 40,
      packetLossPercentage: 59.4,
      streamCount: 38000,
      impactPercentage: 82
    },
    returnPath: {
      mosPercentage: 88,
      streamCount: 6500,
      impactPercentage: 46
    },
    analysis: {
      impactedStreamsPercentage: 82,
      sourceToDestPercentage: 9,
      overlapAnalysis: "Analysis pending for Mumbai route impact correlation."
    },
    additionalStats: {
      sourceMOS: 56.9,
      sourcePacketLoss: 55,
      destinationMOS: 56,
      destinationPacketLoss: 29
    }
  };
  
  // Generate historical data (sample for overtime view)
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
      currentTime: "08/12/14 at 07:30 pm IST",
      startTime: "08/12/14 at 06:30 pm IST"
    },
    issueDetails: {
      mainNode: "Denver",
      degradationPercentage: 56.9,
      application: "Audio",
      vlan: "Unknown",
      codec: "G.729"
    },
    locations,
    routes,
    routeDetails,
    historicalData
  };

  return mosDashboardData;
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

  console.log("MOS Dashboard data generated successfully!");
};

saveMOSData();