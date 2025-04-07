// src/types/network.ts
export interface Location {
  id: string;
  name: string;
  code: string;
  type: 'ingress' | 'egress';
}

export interface Route {
  id: string;
  sourceId: string;
  destinationId: string;
  totalStreams: number;
  impactedPercentage: number;
  mosScore: number;
  packetLoss: number;
  degradationPercentage: number;
}

export interface BidirectionalRoute {
  forwardRoute: Route;
  reverseRoute: Route;
  overlapAnalysis: string;
}

export interface MonthlyStatistic {
  month: string;
  value: number;
  date: string;
}

export interface ServiceDetails {
  name: string;
  application: string;
  vlan: string;
  codec: string;
}
