import monitorData from './monitor-data.json';
import mosData from './mos-data.json';
import { Domain } from 'types/domain';
import { Service } from 'types/service';
import { MosDashboardData, RouteDetails, HistoricalData } from 'types/mos';

// Helper to ensure type safety by mapping JSON data to typed interfaces
const mapToServiceType = (service: any): Service => {
  return {
    id: service.id,
    name: service.name,
    domainId: service.domainId,
    // Map string status to union type
    status: (service.status === 'normal' || service.status === 'warning' || service.status === 'critical') 
      ? service.status 
      : 'normal',
    criticalityPercentage: service.criticalityPercentage,
    totalRequests: service.totalRequests,
    failedRequests: service.failedRequests,
    alerts: service.alerts,
    criticalAlerts: service.criticalAlerts,
    importance: service.importance,
    hourlyData: service.hourlyData || []
  };
};

// Monitor API mock functions
export const getMockDomains = async (): Promise<Domain[]> => {
  return monitorData.domains;
};

export const getMockServices = async (): Promise<Service[]> => {
  // Map each service to ensure it matches the Service type
  return monitorData.services.map(mapToServiceType);
};

export const getMockServiceDetails = async (serviceId: string): Promise<Service> => {
  const service = monitorData.services.find(s => s.id === serviceId);
  if (!service) {
    throw new Error(`Service with id ${serviceId} not found`);
  }
  return mapToServiceType(service);
};

// MOS API mock functions
export const getMockMOSDashboardData = async (serviceName:string, sourceId: string = 'denver'): Promise<MosDashboardData> => {
  // Filter routes based on sourceId like the mock server does
  const filteredRoutes = mosData.routes.filter(route => route.sourceId === sourceId);
  
  return {
    serviceInfo: mosData.serviceInfo.find(s => s.name === serviceName) || {
      id: '',
      name: '',
      currentTime: '',
      startTime: ''
    },
    issueDetails: {
      ...mosData.issueDetails,
      mainNode: mosData.locations.find(loc => loc.id === sourceId)?.name || mosData.issueDetails.mainNode
    },
    locations: mosData.locations,
    routes: filteredRoutes,
    selectedRoute: null,
    historicalData: [],
    routeHistoricalData: {}
  };
};

// Mock route details
export const getMockRouteDetails = async (routeId: string): Promise<RouteDetails> => {
  // Find the route in the mock data
  const route = mosData.routes.find(r => r.id === routeId);
  
  if (!route) {
    throw new Error(`Route with id ${routeId} not found`);
  }
  
  // Mock detailed route data
  return {
    id: route.id,
    sourceId: route.sourceId,
    destinationId: route.destinationId,
    forwardPath: {
      mosPercentage: route.mosPercentage,
      packetLossPercentage: route.packetLossPercentage,
      streamCount: route.streamCount,
      impactPercentage: route.impactPercentage
    },
    returnPath: {
      mosPercentage: route.mosPercentage - 5, // Simulate some difference
      streamCount: route.streamCount,
      impactPercentage: route.impactPercentage - 3
    },
    analysis: {
      impactedStreamsPercentage: Math.round(route.impactPercentage * 0.8),
      sourceToDestPercentage: 65,
      overlapAnalysis: "Partial overlap with other affected routes"
    },
    additionalStats: {
      sourceMOS: route.mosPercentage + 2,
      sourcePacketLoss: route.packetLossPercentage - 1,
      destinationMOS: route.mosPercentage - 3,
      destinationPacketLoss: route.packetLossPercentage + 1
    }
  };
};

// Mock historical data
export const getMockHistoricalData = async (
  routeId: string,
  sourceId: string = 'denver'
): Promise<HistoricalData[]> => {
  // Generate 6 months of mock historical data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  return months.map(month => ({
    month,
    ingressValue: 70 + Math.floor(Math.random() * 20),
    egressValue: 65 + Math.floor(Math.random() * 25)
  }));
}; 