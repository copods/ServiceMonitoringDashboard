// Mock data generation script for the dashboard app
const fs = require("fs");
const path = require("path");

// Helper function to generate random integer
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Generate services for domains
const generateServicesAndDomains = () => {
  // Define domain base structure with industry-specific names
  const domainBases = [
    { name: "Infrastructure", shortCode: "INFRA", colorCode: "#54D6FF" },
    { name: "Security Operations", shortCode: "SECOPS", colorCode: "#728E4F" },
    { name: "Application Stack", shortCode: "APPSTK", colorCode: "#9290F7" },
    { name: "Network Services", shortCode: "NETSVC", colorCode: "#FF82FE" },
  ];

  // Service name components for generating realistic but shorter IT/Networking service names
  const serviceNameComponents = {
    INFRA: {
      prefixes: ["comp", "stor", "vm", "ctr", "k8s", "db", "cache", "que", "load", "bak"],
      criticalPrefixes: ["c-", "p-", "main-"],
      warningPrefixes: ["s-", "r-", "f-"],
      suffixes: ["cl", "nd", "pl", "fm", "ar", "bal", "vt", "eng", "px"]
    },
    SECOPS: {
      prefixes: ["fw", "auth", "id", "acc", "tht", "vuln", "comp", "crypt", "cert", "key"],
      criticalPrefixes: ["g-", "p-", "m-"],
      warningPrefixes: ["b-", "i-", "z-"],
      suffixes: ["ctl", "mgr", "det", "scn", "enf", "mon", "anl", "val", "svc"]
    },
    APPSTK: {
      prefixes: ["api", "web", "mob", "pay", "bill", "usr", "cnt", "srch", "ntf", "anlt"],
      criticalPrefixes: ["c-", "m-", "cntrl-"],
      warningPrefixes: ["sup-", "aux-", "sec-"],
      suffixes: ["svc", "gw", "eng", "proc", "mgr", "hdl", "plat", "sys", "ptl"]
    },
    NETSVC: {
      prefixes: ["dns", "dhcp", "vpn", "wan", "lan", "rtr", "swt", "cdn", "prx", "trf"],
      criticalPrefixes: ["m-", "c-", "bb-"],
      warningPrefixes: ["e-", "b-", "r-"],
      suffixes: ["ctl", "svc", "res", "cl", "opt", "gw", "acc", "mgr", "nd"]
    }
  };

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

      // Generate importance value (0-100)
      // Critical services tend to be more important
      const importanceBase =
        status === "critical" ? 50 : status === "warning" ? 30 : 10;
      const importance = Math.min(100, importanceBase + randomInt(0, 50));

      // Generate total requests based on importance
      // Ensure services with importance > 75% have totalRequests <= 10,000
      let baseRequests;
      if (importance > 75) {
        baseRequests = randomInt(1000, 10000); // Cap at 10,000 for high importance services
      } else {
        baseRequests =
          status === "critical"
            ? randomInt(5000, 10000) // Cap at 10,000
            : status === "warning"
              ? randomInt(1000, 4999)
              : randomInt(100, 999);
      }

      const totalRequests = Math.min(10000, Math.floor(baseRequests));

      // Calculate failed requests based on criticality
      // Ensure all services have failedRequests <= 10,000
      let failedRequests = Math.floor(
        totalRequests * (criticalityPercentage / 100),
      );
      
      // Cap failed requests at 10,000
      failedRequests = Math.min(10000, failedRequests);

      // Generate hourly data for 24 hours
      const hourlyData = [];
      for (let hour = 0; hour < 24; hour++) {
        const hourlyTotal = Math.floor(
          (totalRequests / 24) * (0.5 + Math.random()),
        );
        const hourlyFailed =
          status === "normal"
            ? Math.floor(hourlyTotal * (randomInt(1, 5) / 100))
            : status === "warning"
              ? Math.floor(hourlyTotal * (randomInt(5, 30) / 100))
              : Math.floor(hourlyTotal * (randomInt(30, 95) / 100));

        hourlyData.push({
          hour,
          totalRequests: hourlyTotal,
          failedRequests: hourlyFailed,
          timestamp: new Date(2014, 4, 22, hour).toISOString(),
        });
      }


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

      // Generate a shorter, meaningful IT/Networking service name
      const nameParts = serviceNameComponents[baseDomain.shortCode];
      let serviceName;
      
      if (status === "critical") {
        // For critical services, use critical prefixes with base only (no suffix)
        const prefix = nameParts.criticalPrefixes[randomInt(0, nameParts.criticalPrefixes.length - 1)];
        const base = nameParts.prefixes[randomInt(0, nameParts.prefixes.length - 1)];
        serviceName = `${prefix}${base}`;
      } else if (status === "warning") {
        // For warning services, use just the base with a suffix
        const base = nameParts.prefixes[randomInt(0, nameParts.prefixes.length - 1)];
        serviceName = `${base}-${status.charAt(0)}`;
      } else {
        // For normal services, just use base
        const base = nameParts.prefixes[randomInt(0, nameParts.prefixes.length - 1)];
        serviceName = base;
      }
      
      // Add short domain code and ID for uniqueness, but keep it compact
      serviceName = `${baseDomain.shortCode.substring(0, 2)}${serviceName}${serviceId}`;

      services.push({
        id: serviceId.toString(),
        name: serviceName,
        domainId: id,
        status,
        criticalityPercentage,
        totalRequests,
        failedRequests,
        alerts,
        criticalAlerts,
        importance,
        hourlyData,
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
    path.join(__dirname, "..", "data/monitor-data.json"),
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
