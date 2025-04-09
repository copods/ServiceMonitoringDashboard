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
 * @param sourceId The ID of the source location (optional, defaults to 'denver')
 */
export const fetchHistoricalData = async (sourceId: string = 'denver'): Promise<HistoricalData[]> => {
  // Add sourceId as a query parameter
  const response = await api.get(`/api/mos/historical?sourceId=${sourceId}`);
  return response.data;
};

/**
 * Fetches complete MOS dashboard data including route details and historical data
 * This is a convenience method that combines multiple API calls
 * @param sourceId The ID of the source location (optional, defaults to 'denver')
 */
export const fetchCompleteMOSDashboardData = async (sourceId: string = 'denver'): Promise<MosDashboardData> => {
  // Add sourceId as a query parameter to the dashboard fetch
  // Note: We assume the dashboard endpoint itself needs the sourceId now,
  // replacing the separate fetchMOSDashboardData call.
  // If fetchMOSDashboardData still exists and is needed without sourceId,
  // this logic might need adjustment based on API design.
  const response = await api.get(`/api/mos/dashboard?sourceId=${sourceId}`);
  const historicalData = await fetchHistoricalData(sourceId); // Pass sourceId here too

  // Initially, no route is selected
  return {
    ...response.data, // Use data from the combined dashboard fetch
    selectedRoute: null,
    historicalData
  };
};
