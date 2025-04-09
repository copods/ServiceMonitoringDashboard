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
 * @param sourceId The ID of the source location (optional, defaults to 'denver')
 */
export const fetchMOSDashboardData = async (sourceId: string = 'denver'): Promise<MosDashboardData> => {
  const response = await api.get(`/api/mos/dashboard?sourceId=${sourceId}`);
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
 * Fetches historical data for a specific route
 * @param routeId The ID of the route to fetch historical data for
 * @param sourceId Optional source location ID for filtering
 */
export const fetchHistoricalData = async (
  routeId: string,
  sourceId: string = 'denver'
): Promise<HistoricalData[]> => {
  // Add routeId and sourceId as query parameters
  const response = await api.get(`/api/mos/historical?sourceId=${sourceId}&routeId=${routeId}`);
  return response.data;
};

/**
 * Fetches complete MOS dashboard data including route details and historical data
 * This is a convenience method that combines multiple API calls
 * @param sourceId The ID of the source location (optional, defaults to 'denver')
 * @param routeId Optional initial route ID to fetch details for
 */
export const fetchCompleteMOSDashboardData = async (
  sourceId: string = 'denver',
  routeId?: string
): Promise<MosDashboardData> => {
  // Fetch dashboard data for the specified source
  const response = await api.get(`/api/mos/dashboard?sourceId=${sourceId}`);

  // Initialize with empty historicalData - will be fetched when a route is selected
  const dashboardData: MosDashboardData = {
    ...response.data,
    selectedRoute: null,
    historicalData: response.data.historicalData || [], // Keep existing historical data
    routeHistoricalData: {} // Initialize empty map for route-specific historical data
  };

  // If a routeId is provided, fetch its details
  if (routeId) {
    try {
      const routeDetails = await fetchRouteDetails(routeId);
      dashboardData.selectedRoute = routeDetails;

      // Also fetch historical data for the selected route
      try {
        const historicalData = await fetchHistoricalData(routeId, sourceId);
        // Store this in both the backward-compatible location and the route-specific map
        dashboardData.historicalData = historicalData;
        if (!dashboardData.routeHistoricalData) dashboardData.routeHistoricalData = {};
        dashboardData.routeHistoricalData[routeId] = historicalData;
      } catch (histErr) {
        console.warn(`Failed to fetch initial historical data for route ${routeId}:`, histErr);
      }
    } catch (routeErr) {
      console.warn(`Failed to fetch initial route details for ${routeId}:`, routeErr);
    }
  }

  return dashboardData;
};
