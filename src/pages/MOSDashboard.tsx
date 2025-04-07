import React, { useEffect, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from 'store';
import {
  fetchNetworkDataStart,
  fetchNetworkDataSuccess,
  fetchNetworkDataFailure,
  selectRoute
} from 'store/slices/networkSlice';
import { fetchNetworkLocations, fetchNetworkRoutes, fetchRouteStatistics } from 'services/api/networkApi';

import MOSDashboardLayout from 'components/layout/MOSDashboardLayout';
import NetworkFlowChart from 'components/charts/network-flow/NetworkFlowChart';
import RouteAnalysis from 'components/route-analysis/RouteAnalysis';
import DashboardErrorState from 'components/common/DashboardErrorState';

const MOSDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { locations, routes, loading, error, selectedRoute } = useSelector((state: RootState) => state.network);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Load network data on component mount
  useEffect(() => {
    const loadNetworkData = async () => {
      if (initialLoadComplete) return; // Prevent re-fetching on re-renders after initial load

      dispatch(fetchNetworkDataStart());
      try {
        const [locationsData, routesData] = await Promise.all([
          fetchNetworkLocations(),
          fetchNetworkRoutes()
        ]);

        // Find the default route (Denver to Pune)
        const denverToPuneRoute = routesData.find(route => 
          route.sourceId === 'denver' && route.destinationId === 'pune'
        );

        let initialStatistics: any[] = []; // Use any[] for initial flexibility
        let initialRouteId: string | null = null;

        if (denverToPuneRoute) {
          initialStatistics = await fetchRouteStatistics(
            denverToPuneRoute.sourceId, 
            denverToPuneRoute.destinationId
          );
          initialRouteId = denverToPuneRoute.id;
        } else if (routesData.length > 0) {
           // Fallback: Select the first route if Denver-Pune doesn't exist
           const firstRoute = routesData[0];
           initialStatistics = await fetchRouteStatistics(firstRoute.sourceId, firstRoute.destinationId);
           initialRouteId = firstRoute.id;
        }

        dispatch(fetchNetworkDataSuccess({
          locations: locationsData,
          routes: routesData,
          statistics: initialStatistics // Pass fetched or empty stats
        }));
        
        // Select the default/first route if found
        if (initialRouteId) {
          dispatch(selectRoute(initialRouteId));
        }
        setInitialLoadComplete(true); // Mark initial load as complete

      } catch (err) {
        console.error("Failed to load network data:", err); // Log the error
        dispatch(fetchNetworkDataFailure((err as Error).message || 'Unknown error fetching network data'));
        setInitialLoadComplete(true); // Also mark complete on error to prevent loops
      }
    };
    
    loadNetworkData();
  }, [dispatch, initialLoadComplete]); // Depend on initialLoadComplete
  
  // Handle route selection
  const handleRouteSelect = useCallback(async (routeId: string) => {
    // Avoid re-selecting the same route or fetching if already selected
    if (selectedRoute?.forwardRoute.id === routeId) return; 

    dispatch(selectRoute(routeId));
    
    // Fetch route-specific statistics when a new route is selected
    try {
      const route = routes.find(r => r.id === routeId);
      if (route) {
        dispatch(fetchNetworkDataStart()); // Indicate loading for stats fetch
        const statistics = await fetchRouteStatistics(route.sourceId, route.destinationId);
        // Dispatch success with existing locations/routes but updated statistics
        dispatch(fetchNetworkDataSuccess({
          locations: locations, // Keep existing locations
          routes: routes,       // Keep existing routes
          statistics: statistics // Update statistics
        }));
      }
    } catch (error) {
      console.error('Failed to fetch route statistics:', error);
       dispatch(fetchNetworkDataFailure((error as Error).message || 'Failed to fetch statistics for selected route'));
    }
  }, [dispatch, routes, locations, selectedRoute]); // Add dependencies
  
  // Retry function for error state
  const handleRetry = () => {
    setInitialLoadComplete(false); // Reset initial load flag to allow refetch
    // The useEffect hook will trigger the fetch again
  };

  // Loading state (only show initial loading)
  if (loading && !initialLoadComplete) {
    return (
      <MOSDashboardLayout>
        <div className="flex items-center justify-center h-full"> {/* Use full height */}
          <div className="text-xl text-white">Loading network data...</div>
        </div>
      </MOSDashboardLayout>
    );
  }
  
  // Error state (only show if initial load failed)
  if (error && !initialLoadComplete && locations.length === 0) {
     // Assuming DashboardErrorState component exists and accepts these props
    return <DashboardErrorState error={error} onRetry={handleRetry} />;
  }
  
  const sourceLocation = locations.find(loc => loc.type === 'ingress');
  const destinationLocations = locations.filter(loc => loc.type === 'egress');
  
  // Handle case where source location isn't found after loading
  if (initialLoadComplete && !sourceLocation) {
    return (
      <MOSDashboardLayout>
        <div className="text-red-500 p-4">Error: Source (ingress) location not found in the data.</div>
      </MOSDashboardLayout>
    );
  }
  
  // Handle case where no locations are loaded
  if (initialLoadComplete && locations.length === 0) {
     return (
      <MOSDashboardLayout>
        <div className="text-yellow-500 p-4">No network locations loaded. Check the data source.</div>
      </MOSDashboardLayout>
    );
  }

  // Filter routes originating from the source location for the chart
  const sourceRoutes = routes.filter(route => route.sourceId === sourceLocation?.id);

  return (
    <MOSDashboardLayout>
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-160px)]"> {/* Adjust height based on layout headers */}
        {/* Left Side - Network Flow Visualization */}
        <div className="col-span-6 h-full overflow-hidden"> {/* Ensure full height and prevent overflow */}
          {sourceLocation && destinationLocations.length > 0 ? (
            <NetworkFlowChart
              sourceLocation={sourceLocation}
              destinationLocations={destinationLocations}
              routes={sourceRoutes}
              width={window.innerWidth * 0.45} // More responsive width calculation
              height={window.innerHeight * 0.7} // More responsive height calculation
              onRouteSelect={handleRouteSelect}
            />
          ) : (
             <div className="bg-gray-800 p-6 rounded h-full flex items-center justify-center text-gray-400">Loading chart data or no destinations found...</div>
          )}
        </div>
        
        {/* Right Side - Route Analysis */}
        <div className="col-span-6 h-full overflow-hidden"> {/* Ensure full height and prevent overflow */}
          <RouteAnalysis
            width={window.innerWidth * 0.45} // More responsive width calculation
            height={window.innerHeight * 0.7} // More responsive height calculation
          />
        </div>
      </div>
    </MOSDashboardLayout>
  );
};

export default MOSDashboard;
