import { useEffect, useCallback, useMemo } from "react"; // Add useMemo
import { useAppDispatch, useAppSelector } from "store"; // Assuming store index exports these
import {
  fetchInitialMOSData,
  fetchRouteDetailsById,
  setSelectedSourceLocation, // Import new action
  selectMOSData,
  selectMOSLocationsMap,
  selectMOSIsLoading,
  selectMOSIsRouteLoading,
  selectMOSError,
  selectSelectedRouteId,
  selectSelectedSourceId, // Import new selector
  // setSelectedRouteIdAction // Potentially needed if we want instant UI feedback before fetch
} from "store/slices/mosSlice";
import { MosDashboardData, Location } from "types/mos"; // Keep type imports

// Interface remains the same as it defines the hook's return contract
interface UseMOSDashboardDataResult {
  dashboardData: MosDashboardData | null;
  locationsMap: Record<string, Location>;
  isLoading: boolean; // Reflects initial data loading state from Redux
  isRouteLoading: boolean; // Reflects route detail loading state from Redux
  error: string | null; // Reflects error state from Redux
  selectedRouteId: string | null; // Reflects selected route ID from Redux
  selectedSourceId: string; // Add selected source ID
  availableLocationNames: string[]; // Add available location names
  selectRoute: (routeId: string) => void; // Function to trigger route selection/fetch
  changeSourceLocation: (locationId: string) => void; // Function to change source location
  retryFetch: () => void; // Function to retry initial data fetch
}

export const useMOSDashboardData = (): UseMOSDashboardDataResult => {
  const dispatch = useAppDispatch();

  // Select state from Redux store
  const dashboardData = useAppSelector(selectMOSData);
  const locationsMap = useAppSelector(selectMOSLocationsMap);
  const isLoading = useAppSelector(selectMOSIsLoading);
  const isRouteLoading = useAppSelector(selectMOSIsRouteLoading);
  const error = useAppSelector(selectMOSError);
  const selectedRouteId = useAppSelector(selectSelectedRouteId); // Get initial/current ID from store
  const selectedSourceId = useAppSelector(selectSelectedSourceId); // Get selected source ID

  // Fetch initial data on mount using the initial selectedRouteId and selectedSourceId from the store
  useEffect(() => {
    // Only fetch if data isn't already loaded or loading
    if (!dashboardData && !isLoading) {
       // Pass both sourceId and optional routeId
       dispatch(fetchInitialMOSData({ 
         sourceId: selectedSourceId, 
         routeId: selectedRouteId ?? undefined 
       }));
    }
  }, [dispatch, dashboardData, isLoading, selectedRouteId, selectedSourceId]); // Add selectedSourceId dependency

  // Function to select a route and fetch its details
  // Define selectRoute *before* the useEffect that uses it
  const selectRoute = useCallback((routeId: string) => {
    // Prevent selection if same route is clicked or route loading is in progress
    if (!routeId || selectedRouteId === routeId || isRouteLoading) {
       console.log("Selection prevented:", { routeId, selectedRouteId, isRouteLoading });
       return;
    }

    // Dispatch the thunk to fetch route details.
    // The thunk's pending action will update selectedRouteId and isRouteLoading state.
    console.log("Dispatching fetchRouteDetailsById for:", routeId);
    dispatch(fetchRouteDetailsById(routeId));

    // Optional: Dispatch an action immediately to update selectedRouteId in UI
    // if you need instant feedback before the async operation starts/completes.
    // The thunk already handles this in its pending state, so this might be redundant.
    // dispatch(setSelectedRouteIdAction(routeId));

  }, [dispatch, selectedRouteId, isRouteLoading]); // Add dependencies

  // Effect to automatically select the first route when data loads for a new source
  // and no route is currently selected.
  // Now defined *after* selectRoute
  useEffect(() => {
    // Check if loading is finished, data is available, has routes, and no route is selected
    if (!isLoading && dashboardData && dashboardData.routes.length > 0 && !selectedRouteId) {
      const firstRouteId = dashboardData.routes[0].id;
      console.log(`Auto-selecting first route: ${firstRouteId}`);
      // Use the existing selectRoute function to fetch details
      selectRoute(firstRouteId); 
    }
    // Dependencies: run when loading finishes or data/selectedRouteId changes
    // Add selectRoute to dependency array as it's used inside
  }, [isLoading, dashboardData, selectedRouteId, selectRoute, dispatch]); 

  // Function to change the source location
  const changeSourceLocation = useCallback((locationId: string) => {
    if (locationId !== selectedSourceId) {
      // Dispatch action to update the source ID in Redux state
      dispatch(setSelectedSourceLocation(locationId));
      // Trigger data fetch for the new source location
      // No routeId is passed initially when changing source
      dispatch(fetchInitialMOSData({ sourceId: locationId })); 
    }
  }, [dispatch, selectedSourceId]); // Add dependencies

  // Get all available location names for the dropdown
  const availableLocationNames = useMemo(() => {
    if (!dashboardData?.locations) return [];
    // Sort alphabetically for consistent dropdown order
    return dashboardData.locations.map(location => location.name).sort(); 
  }, [dashboardData?.locations]);

  // Function to retry fetching initial data
  const retryFetch = useCallback(() => {
    // Dispatch the initial fetch thunk again, passing the current selected IDs from store
    dispatch(fetchInitialMOSData({ 
      sourceId: selectedSourceId, 
      routeId: selectedRouteId ?? undefined 
    }));
  }, [dispatch, selectedRouteId, selectedSourceId]); // Add dependencies

  // Return the state selected from Redux and the action dispatching functions
  return {
    dashboardData,
    locationsMap,
    isLoading,
    isRouteLoading,
    error,
    selectedRouteId,
    selectedSourceId, // Return new state
    availableLocationNames, // Return location names
    selectRoute,
    changeSourceLocation, // Return new function
    retryFetch,
  };
};

// No need for default export if named export is used consistently
// export default useMOSDashboardData;
