import { useState, useEffect } from "react";
import { MosDashboardData, RouteDetails } from "../types/mos"; // Adjust path
import {
  fetchCompleteMOSDashboardData,
  fetchRouteDetails,
} from "../services/api/mosApi"; // Adjust path

interface UseMOSDashboardDataResult {
  dashboardData: MosDashboardData | null;
  isLoading: boolean;
  error: string | null;
  selectedRouteId: string | null;
  selectRoute: (routeId: string) => void;
}

export const useMOSDashboardData = (): UseMOSDashboardDataResult => {
  const [dashboardData, setDashboardData] =
    useState<MosDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Default selection matches screenshot's initial state
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(
    "denver-pune",
  );

  // Fetch initial dashboard data and pre-select route
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null); // Clear previous errors
        const data = await fetchCompleteMOSDashboardData();

        // Auto-select the default route initially if data is loaded
        if (data && selectedRouteId) {
          try {
            const routeDetails = await fetchRouteDetails(selectedRouteId);
            data.selectedRoute = routeDetails;
          } catch (routeError) {
            console.error(
              "Failed to load initial route details:",
              routeError,
            );
            // Don't set main error, maybe just log or clear selection
            data.selectedRoute = null;
            setSelectedRouteId(null);
          }
        } else if (data) {
          // If no default route ID or it failed, ensure selectedRoute is null
          data.selectedRoute = null;
        }

        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching MOS dashboard data:", err);
        setError(
          "Failed to fetch MOS dashboard data. Please try again later.",
        );
        setDashboardData(null); // Clear data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Rerun only if the default selectedRouteId changes (it doesn't here, but good practice)
  }, [selectedRouteId]); // Dependency array includes selectedRouteId for initial load logic

  // Fetch route details when a route is selected by user interaction
  const selectRoute = async (routeId: string) => {
    // Prevent selection if data isn't loaded or same route is clicked
    if (!routeId || !dashboardData || selectedRouteId === routeId) return;

    // Store previous details in case fetch fails
    const previousSelectedRoute = dashboardData.selectedRoute;
    const previousSelectedId = selectedRouteId;

    // Optimistically update UI
    setSelectedRouteId(routeId);
    setDashboardData((prev) =>
      prev ? { ...prev, selectedRoute: null } : null,
    ); // Show loading/clear details
    // Consider setting a specific loading state for the detail panel

    try {
      // No need for setIsLoading(true) here if handled within components or optimistically
      const routeDetails = await fetchRouteDetails(routeId);

      setDashboardData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          selectedRoute: routeDetails,
        };
      });
      setError(null); // Clear error on success
    } catch (err) {
      console.error(`Error fetching details for route ${routeId}:`, err);
      setError(
        `Failed to fetch details for the selected route. Please try again later.`,
      );
      // Revert to previous state on error
      setSelectedRouteId(previousSelectedId);
      setDashboardData((prev) =>
        prev ? { ...prev, selectedRoute: previousSelectedRoute } : null,
      );
    } finally {
      // No need for setIsLoading(false) here if handled within components
    }
  };

  return {
    dashboardData,
    isLoading, // This reflects initial load mainly
    error,
    selectedRouteId,
    selectRoute,
  };
};

export default useMOSDashboardData;
