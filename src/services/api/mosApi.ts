// import axios from 'axios';
import { MosDashboardData, RouteDetails, HistoricalData } from 'types/mos';
import { Service } from 'types/service';
import { 
  getMockMOSDashboardData, 
  getMockRouteDetails, 
  getMockHistoricalData 
} from '../mock-data/mockDataService';

// Always use mock data regardless of environment
// const USE_MOCK_DATA = true;

// // Only kept for potential future use
// const API_URL = process.env.REACT_APP_API_URL || '';
// const api = null; // Not initializing axios since we're always using mock data

/**
 * Fetches the MOS dashboard data including service info, issue details,
 * locations and routes
 * @param sourceId The ID of the source location (optional, defaults to 'denver')
 */
export const fetchMOSDashboardData = async (sourceId: string = 'denver'): Promise<MosDashboardData> => {
  console.log(`Using mock data for MOS dashboard, source: ${sourceId}`);
  console.log("here 1 ",getMockMOSDashboardData(sourceId))
  return getMockMOSDashboardData(sourceId);
};

/**
 * Fetches the details for a specific route
 * @param routeId The ID of the route to fetch details for
 */
export const fetchRouteDetails = async (routeId: string): Promise<RouteDetails> => {
  console.log(`Using mock data for route details: ${routeId}`);
  return getMockRouteDetails(routeId);
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
  console.log(`Using mock data for historical data, route: ${routeId}, source: ${sourceId}`);
  return getMockHistoricalData(routeId, sourceId);
};

/**
 * Fetches complete MOS dashboard data including route details and historical data
 * This is a convenience method that combines multiple API calls
 * @param sourceId The ID of the source location (optional, defaults to 'denver')
 * @param routeId Optional initial route ID to fetch details for
 * @param service Optional service to update the service info
 */
export const fetchCompleteMOSDashboardData = async (
  // sourceId: string = 'denver',
  sourceId: string ,
  routeId?: string
): Promise<MosDashboardData> => {
  console.log(`Using mock data for complete MOS dashboard, source: ${sourceId}`);
  let dashboardData = await getMockMOSDashboardData(sourceId);
console.log("here 2 ",dashboardData)
  // If a routeId is provided, fetch its details
  if (routeId) {
    try {
      const routeDetails = await getMockRouteDetails(routeId);
      dashboardData.selectedRoute = routeDetails;

      // Also fetch historical data for the selected route
      try {
        const historicalData = await getMockHistoricalData(routeId, sourceId);
        
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
