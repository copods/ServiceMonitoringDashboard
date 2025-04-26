import { useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "store";
import {
  fetchInitialMOSData,
  fetchRouteDetailsById,
  fetchHistoricalDataForRoute,
  setSelectedSourceLocation,
  resetHistoricalData,
  selectMOSData,
  selectMOSLocationsMap,
  selectMOSIsLoading,
  selectMOSIsRouteLoading,
  selectIsHistoricalDataLoading,
  selectMOSError,
  selectSelectedRouteId,
  selectSelectedSourceId,
  selectHistoricalDataForRoute,
  setSelectedRouteIdAction
} from "store/slices/mosSlice";
import { MosDashboardData, Location, HistoricalData } from "types/mos";

// Update interface to include historical data
interface UseMOSDashboardDataResult {
  dashboardData: MosDashboardData | null;
  locationsMap: Record<string, Location>;
  historicalData: HistoricalData[];
  isLoading: boolean;
  isRouteLoading: boolean;
  isHistoricalDataLoading: boolean;
  error: string | null;
  selectedRouteId: string | null;
  selectedSourceId: string;
  availableLocationNames: string[];
  selectRoute: (routeId: string) => void;
  changeSourceLocation: (locationId: string) => void;
  retryFetch: () => void;
}

export const useMOSDashboardData = (): UseMOSDashboardDataResult => {
  const dispatch = useAppDispatch();

  // Select state from Redux store
  const dashboardData = useAppSelector(selectMOSData);
  const locationsMap = useAppSelector(selectMOSLocationsMap);
  const isLoading = useAppSelector(selectMOSIsLoading);
  const isRouteLoading = useAppSelector(selectMOSIsRouteLoading);
  const isHistoricalDataLoading = useAppSelector(selectIsHistoricalDataLoading);
  const error = useAppSelector(selectMOSError);
  const selectedRouteId = useAppSelector(selectSelectedRouteId);
  const selectedSourceId = useAppSelector(selectSelectedSourceId);

  // Get historical data for the selected route
  const historicalData = useAppSelector(
    selectHistoricalDataForRoute(selectedRouteId || null)
  );

  // Fetch initial data on mount using the initial selectedRouteId and selectedSourceId from the store
  useEffect(() => {
    // Only fetch if data isn't already loaded or loading
    if (!dashboardData && !isLoading) {
       // Pass both sourceId and optional routeId
       dispatch(fetchInitialMOSData({
         sourceId: selectedSourceId,
         routeId: selectedRouteId || undefined
       }));
    }
  }, [dispatch, dashboardData, isLoading, selectedRouteId, selectedSourceId]);

  // Function to select a route, fetch its details, and also fetch its historical data
  const selectRoute = useCallback((routeId: string) => {
    if (!routeId || selectedRouteId === routeId || isRouteLoading) {
      return;
    }

    // Dispatch the thunk to fetch route details
    dispatch(fetchRouteDetailsById(routeId));

    // Also fetch historical data for the selected route
    dispatch(fetchHistoricalDataForRoute({
      routeId,
      sourceId: selectedSourceId
    }));

  }, [dispatch, selectedRouteId, isRouteLoading, selectedSourceId]);

  // Effect to automatically select the first route when data loads for a new source
  // and no route is currently selected
  useEffect(() => {
    // Check if loading is finished, data is available, has routes, and no route is selected
    if (!isLoading && dashboardData && dashboardData.routes.length > 0 && !selectedRouteId) {
      const firstRouteId = dashboardData.routes[0].id;

      // Use the existing selectRoute function to fetch details
      selectRoute(firstRouteId);
    }
  }, [isLoading, dashboardData, selectedRouteId, selectRoute]);

  // Function to change the source location
  const changeSourceLocation = useCallback((locationId: string) => {
    if (locationId !== selectedSourceId) {
      // Dispatch action to update the source ID in Redux state
      dispatch(setSelectedSourceLocation(locationId));
      // Reset historical data when changing source
      dispatch(resetHistoricalData());
      // Trigger data fetch for the new source location
      dispatch(fetchInitialMOSData({ sourceId: locationId }));
    }
  }, [dispatch, selectedSourceId]);

  // Get all available location names for the dropdown
  const availableLocationNames = useMemo(() => {
    if (!dashboardData?.locations) return [];
    // Sort alphabetically for consistent dropdown order
    return dashboardData.locations.map((location: Location) => location.name).sort();
  }, [dashboardData?.locations]);

  // Function to retry fetching initial data
  const retryFetch = useCallback(() => {
    // Dispatch the initial fetch thunk again
    dispatch(fetchInitialMOSData({
      sourceId: selectedSourceId,
      routeId: selectedRouteId || undefined
    }));
  }, [dispatch, selectedRouteId, selectedSourceId]);

  // Return the state selected from Redux and the action dispatching functions
  return {
    dashboardData,
    locationsMap,
    historicalData,
    isLoading,
    isRouteLoading,
    isHistoricalDataLoading,
    error,
    selectedRouteId,
    selectedSourceId,
    availableLocationNames,
    selectRoute,
    changeSourceLocation,
    retryFetch,
  };
};
