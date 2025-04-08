import axios from 'axios';
import { MosDashboardData, RouteDetails, HistoricalData } from 'types/mos';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Fetches the MOS dashboard data including service info, issue details,
 * locations and routes
 */
export const fetchMOSDashboardData = async (): Promise<MosDashboardData> => {
  const response = await api.get('/api/mos/dashboard');
  return response.data;
};

/**
 * Fetches the details for a specific route
 * @param routeId The ID of the route to fetch details for
 */
export const fetchRouteDetails = async (routeId: string): Promise<RouteDetails> => {
  const response = await api.get(`/api/mos/route/${routeId}`);
  return response.data;
};

/**
 * Fetches historical data for the MOS dashboard
 */
export const fetchHistoricalData = async (): Promise<HistoricalData[]> => {
  const response = await api.get('/api/mos/historical');
  return response.data;
};

/**
 * Fetches complete MOS dashboard data including route details and historical data
 * This is a convenience method that combines multiple API calls
 */
export const fetchCompleteMOSDashboardData = async (): Promise<MosDashboardData> => {
  const dashboardData = await fetchMOSDashboardData();
  const historicalData = await fetchHistoricalData();
  
  // Initially, no route is selected
  return {
    ...dashboardData,
    selectedRoute: null,
    historicalData
  };
};
