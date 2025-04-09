import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "store"; // Assuming store index exports these
import {
  fetchInitialMOSData,
  fetchRouteDetailsById,
  selectMOSData,
  selectMOSLocationsMap,
  selectMOSIsLoading,
  selectMOSIsRouteLoading,
  selectMOSError,
  selectSelectedRouteId,
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
  selectRoute: (routeId: string) => void; // Function to trigger route selection/fetch
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

  // Fetch initial data on mount using the initial selectedRouteId from the store
  useEffect(() => {
    // Only fetch if data isn't already loaded or loading
    // This prevents re-fetching on component re-renders if data is present
    if (!dashboardData && !isLoading) {
       dispatch(fetchInitialMOSData(selectedRouteId ?? undefined)); // Pass current selected ID or undefined
    }
  }, [dispatch, dashboardData, isLoading, selectedRouteId]); // Add dependencies

  // Function to select a route and fetch its details
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

  // Function to retry fetching initial data
  const retryFetch = useCallback(() => {
    // Dispatch the initial fetch thunk again, passing the current selected ID from store
    dispatch(fetchInitialMOSData(selectedRouteId ?? undefined));
  }, [dispatch, selectedRouteId]); // Add dependency

  // Return the state selected from Redux and the action dispatching functions
  return {
    dashboardData,
    locationsMap,
    isLoading,
    isRouteLoading,
    error,
    selectedRouteId,
    selectRoute,
    retryFetch,
  };
};

// No need for default export if named export is used consistently
// export default useMOSDashboardData;
