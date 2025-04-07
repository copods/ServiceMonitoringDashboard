import axios from 'axios';
import { Location, Route, MonthlyStatistic } from 'types/network';

// Assuming the mock server runs on localhost:3001
const API_BASE_URL = 'http://localhost:3001/api/network';

export const fetchNetworkLocations = async (): Promise<Location[]> => {
  const response = await axios.get(`${API_BASE_URL}/locations`);
  return response.data;
};

export const fetchNetworkRoutes = async (): Promise<Route[]> => {
  const response = await axios.get(`${API_BASE_URL}/routes`);
  return response.data;
};

export const fetchRouteStatistics = async (sourceId: string, destinationId: string): Promise<MonthlyStatistic[]> => {
  const response = await axios.get(`${API_BASE_URL}/statistics`, {
    params: { sourceId, destinationId }
  });
  return response.data;
};
