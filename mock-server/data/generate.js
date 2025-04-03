// Mock data generation script for the dashboard app
const fs = require("fs");
const path = require("path");

// Helper function to generate random integer
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Generate services for domains
const generateServicesAndDomains = () => {
  // Define domain base structure
  const domainBases = [
    { name: "Domain Enterprise", shortCode: "ENT", colorCode: "#54D6FF" },
    { name: "Domain name text", shortCode: "NET", colorCode: "#728E4F" },
    { name: "Domain 3", shortCode: "D3", colorCode: "#9290F7" },
    { name: "Domain 1", shortCode: "D1", colorCode: "#FF82FE" },
  ];

  // Generate different service counts for each domain (50-100)
  const serviceCounts = domainBases.map(() => randomInt(50, 100));

  // We'll set critical ratio differently for each domain to create variation
  const criticalRatios = [0.12, 0.05, 0.25, 0.19]; // Percentage of services that are critical

  const domains = [];
  const services = [];
  let serviceId = 1;

  // Process each domain
  domainBases.forEach((baseDomain, index) => {
    const id = (index + 1).toString();
    const totalServices = serviceCounts[index];
    const criticalRatio = criticalRatios[index];
    const criticalServices = Math.round(totalServices * criticalRatio);

    // Create the domain
    domains.push({
      id,
      name: baseDomain.name,
      totalServices,
      criticalServices,
      colorCode: baseDomain.colorCode,
    });

    // Generate services for this domain
    // Keep track of critical services to ensure we hit the correct number
    let criticalServiceCount = 0;

    for (let i = 0; i < totalServices; i++) {
      // Calculate if this service should be critical to match our target ratio
      const remainingServices = totalServices - i;
      const remainingCriticalNeeded = criticalServices - criticalServiceCount;

      // Calculate status based on remaining needs
      let status;
      if (remainingCriticalNeeded <= 0) {
        // We've already met our critical quota
        status = Math.random() < 0.25 ? "warning" : "normal";
      } else if (remainingCriticalNeeded >= remainingServices) {
        // We need all remaining services to be critical to hit our quota
        status = "critical";
      } else {
        // Probability-based status
        const criticalProbability = remainingCriticalNeeded / remainingServices;
        const warningProbability = 0.25; // 25% chance for warning among non-critical

        if (Math.random() < criticalProbability) {
          status = "critical";
        } else if (Math.random() < warningProbability) {
          status = "warning";
        } else {
          status = "normal";
        }
      }

      // Update critical service count
      if (status === "critical") {
        criticalServiceCount++;
      }

      // Generate criticality percentage
      const criticalityPercentage =
        status === "critical"
          ? randomInt(60, 95)
          : status === "warning"
            ? randomInt(30, 59)
            : randomInt(1, 29);

      // --- MODIFIED SECTION ---
      // Generate total requests (higher for more critical services) - Reduced Ranges
      const baseRequests =
        status === "critical"
          ? randomInt(5000, 20000) // Reduced from 50k-200k
          : status === "warning"
            ? randomInt(1000, 4999) // Reduced from 10k-50k
            : randomInt(100, 999); // Reduced from 1k-10k
      // --- END MODIFIED SECTION ---

      const totalRequests = Math.floor(baseRequests);

      // Calculate failed requests based on criticality (this will be lower due to lower totalRequests)
      const failedRequests = Math.floor(
        totalRequests * (criticalityPercentage / 100),
      );

      // Generate hourly data for 24 hours (hourly values will also be lower)
      const hourlyData = [];
      for (let hour = 0; hour < 24; hour++) {
        const hourlyTotal = Math.floor(
          (totalRequests / 24) * (0.5 + Math.random()),
        ); // Will be lower
        const hourlyFailed =
          status === "normal"
            ? Math.floor(hourlyTotal * (randomInt(1, 5) / 100)) // Will be lower
            : status === "warning"
              ? Math.floor(hourlyTotal * (randomInt(5, 30) / 100)) // Will be lower
              : Math.floor(hourlyTotal * (randomInt(30, 95) / 100)); // Will be lower

        hourlyData.push({
          hour,
          totalRequests: hourlyTotal,
          failedRequests: hourlyFailed,
          timestamp: new Date(2014, 4, 22, hour).toISOString(),
        });
      }

      // Generate importance value (0-100)
      // Critical services tend to be more important
      const importanceBase =
        status === "critical" ? 50 : status === "warning" ? 30 : 10;
      const importance = Math.min(100, importanceBase + randomInt(0, 50));

      // Generate alerts
      const alerts =
        status === "critical"
          ? randomInt(15, 40)
          : status === "warning"
            ? randomInt(5, 15)
            : randomInt(0, 5);

      const criticalAlerts =
        status === "critical"
          ? randomInt(Math.floor(alerts * 0.5), alerts)
          : status === "warning"
            ? randomInt(1, Math.max(1, Math.floor(alerts * 0.3)))
            : randomInt(0, Math.min(2, alerts));

      // Meaningful service name with domain code
      services.push({
        id: serviceId.toString(),
        name: `${baseDomain.shortCode}-${
          status === "critical" ? "CRIT" : status === "warning" ? "WARN" : "SVC"
        }-${serviceId}`,
        domainId: id,
        status,
        criticalityPercentage,
        totalRequests, // Now lower
        failedRequests, // Now lower
        alerts,
        criticalAlerts,
        importance,
        hourlyData, // Now contains lower hourly values
      });

      serviceId++;
    }
  });

  return { domains, services };
};

// Generate mock data and save to file
const generateMockData = () => {
  const { domains, services } = generateServicesAndDomains();

  const mockData = {
    domains,
    services,
  };

  // Ensure directory exists
  const dbDir = path.join(__dirname, "..");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(__dirname, "..", "db.json"),
    JSON.stringify(mockData, null, 2),
  );

  // Generate statistics to display
  const domainStats = domains.map((domain) => {
    const domainServices = services.filter((s) => s.domainId === domain.id);
    const criticalCount = domainServices.filter(
      (s) => s.status === "critical",
    ).length;
    const warningCount = domainServices.filter(
      (s) => s.status === "warning",
    ).length;
    const normalCount = domainServices.filter(
      (s) => s.status === "normal",
    ).length;

    return {
      id: domain.id,
      name: domain.name,
      totalServices: domain.totalServices,
      configuredCritical: domain.criticalServices,
      servicesGenerated: domainServices.length,
      criticalServicesGenerated: criticalCount,
      warningServicesGenerated: warningCount,
      normalServicesGenerated: normalCount,
    };
  });

  console.log("Mock data generated successfully!");
  console.log(
    `Generated ${domains.length} domains and ${services.length} total services.`,
  );
  console.log("\nServices distribution by domain:");
  domainStats.forEach((stat) => {
    console.log(
      `- ${stat.name}: ${stat.servicesGenerated} services (${stat.criticalServicesGenerated} critical, ${stat.warningServicesGenerated} warning, ${stat.normalServicesGenerated} normal)`,
    );
    console.log(
      `  Configured critical: ${stat.configuredCritical}, Generated critical: ${stat.criticalServicesGenerated}`,
    );
  });
};

generateMockData();
