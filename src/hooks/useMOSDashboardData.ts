import { useState, useEffect } from 'react';
import { MosDashboardData } from 'types/mos';
import { fetchCompleteMOSDashboardData, fetchRouteDetails } from 'services/api/mosApi';

interface UseMOSDashboardDataResult {
  dashboardData: MosDashboardData | null;
  isLoading: boolean;
  error: string | null;
  selectedRouteId: string | null;
  selectRoute: (routeId: string) => void;
}

export const useMOSDashboardData = (): UseMOSDashboardDataResult => {
  const [dashboardData, setDashboardData] = useState<MosDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  // Fetch initial dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCompleteMOSDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching MOS dashboard data:', err);
        setError('Failed to fetch MOS dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch route details when a route is selected
  const selectRoute = async (routeId: string) => {
    if (!routeId || !dashboardData) return;
    
    try {
      setIsLoading(true);
      const routeDetails = await fetchRouteDetails(routeId);
      
      // Update dashboard data with the selected route details
      setDashboardData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          selectedRoute: routeDetails
        };
      });
      
      setSelectedRouteId(routeId);
      setError(null);
    } catch (err) {
      console.error(`Error fetching details for route ${routeId}:`, err);
      setError(`Failed to fetch details for the selected route. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dashboardData,
    isLoading,
    error,
    selectedRouteId,
    selectRoute
  };
};
