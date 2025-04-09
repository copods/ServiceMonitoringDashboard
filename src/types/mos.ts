export interface Location {
  id: string;
  name: string;
  coordinates?: {
    x: number;
    y: number;
  };
}

export interface Route {
  id: string;
  sourceId: string;
  destinationId: string;
  streamCount: number;
  mosPercentage: number;
  packetLossPercentage: number;
  impactPercentage: number;
}

export interface RouteDetails {
  id: string;
  sourceId: string;
  destinationId: string;
  forwardPath: {
    mosPercentage: number;
    packetLossPercentage: number;
    streamCount: number;
    impactPercentage: number;
  };
  returnPath: {
    mosPercentage: number;
    streamCount: number;
    impactPercentage: number;
  };
  analysis: {
    impactedStreamsPercentage: number;
    sourceToDestPercentage: number;
    overlapAnalysis: string;
  };
  additionalStats: {
    sourceMOS: number;
    sourcePacketLoss: number;
    destinationMOS: number;
    destinationPacketLoss: number;
  };
}

export interface HistoricalData {
  month: string;
  ingressValue: number;
  egressValue: number;
}

export interface MosDashboardData {
  serviceInfo: {
    id: string;
    name: string;
    currentTime: string;
    startTime: string;
  };
  issueDetails: {
    mainNode: string;
    degradationPercentage: number;
    application: string;
    vlan: string;
    codec: string;
  };
  locations: Location[];
  routes: Route[];
  selectedRoute: RouteDetails | null;
  historicalData: HistoricalData[]; // Keep for backward compatibility
  routeHistoricalData?: Record<string, HistoricalData[]>; // Add new field for route-specific data
}
