import React, { useMemo } from "react"; // Added useMemo
import { useMOSDashboardData } from "hooks/useMOSDashboardData";
import MOSDashboardHeader from "components/mos/MOSDashboardHeader";
import IssueDetailsBanner from "components/mos/IssueDetailsBanner";
import NetworkGraphPanel from "components/mos/NetworkGraphPanel";
import RouteDetailPanel from "components/mos/RouteDetailPanel";
import DashboardErrorState from "components/common/DashboardErrorState";

const MemoizedHeader = React.memo(MOSDashboardHeader);
const MemoizedIssueBanner = React.memo(IssueDetailsBanner);
const MemoizedNetworkGraph = React.memo(NetworkGraphPanel);
const MemoizedRouteDetailPanel = React.memo(RouteDetailPanel);

const MOSDashboard: React.FC = () => {
  const {
    dashboardData,
    isLoading,
    isRouteLoading,
    error,
    selectedRouteId,
    selectRoute,
    locationsMap,
    retryFetch,
  } = useMOSDashboardData();
  
  // Memoize all props before any conditional returns
  // 1. Network Graph props
  const networkGraphProps = useMemo(() => {
    if (!dashboardData) return null;
    return {
      locations: dashboardData.locations,
      routes: dashboardData.routes,
      onRouteSelected: selectRoute,
      selectedRouteId,
      mainDegradationPercentage: dashboardData.issueDetails?.degradationPercentage || 0
    };
  }, [dashboardData, selectedRouteId, selectRoute]);
  
  // 2. Route Detail props
  const routeDetailProps = useMemo(() => {
    if (!dashboardData?.selectedRoute) return null;
    return {
      routeDetails: dashboardData.selectedRoute,
      historicalData: dashboardData.historicalData || [],
      sourceLocationName: locationsMap[dashboardData.selectedRoute.sourceId]?.name || dashboardData.selectedRoute.sourceId,
      destinationLocationName: locationsMap[dashboardData.selectedRoute.destinationId]?.name || dashboardData.selectedRoute.destinationId,
    };
  }, [dashboardData?.selectedRoute, dashboardData?.historicalData, locationsMap]);

  // 3. Header props
  const headerProps = useMemo(() => {
    return {
      serviceName: dashboardData?.serviceInfo?.name || ''
    };
  }, [dashboardData?.serviceInfo?.name]);

  // 4. Issue Banner props
  const issueBannerProps = useMemo(() => {
    if (!dashboardData?.issueDetails) return null;
    return {
      mainNode: dashboardData.issueDetails.mainNode,
      degradationPercentage: dashboardData.issueDetails.degradationPercentage,
      application: dashboardData.issueDetails.application,
      vlan: dashboardData.issueDetails.vlan,
      codec: dashboardData.issueDetails.codec
    };
  }, [dashboardData?.issueDetails]);

  // Loading state handling
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error handling
  if (error) {
    const errorMessage = error || "An unknown error occurred.";
    return <DashboardErrorState error={errorMessage} onRetry={retryFetch} />;
  }

  // No data handling
  if (!dashboardData) {
    return (
      <div className="p-8 text-center bg-white text-black">
        No data available.
      </div>
    );
  }

  return (
    // Main container uses white background, black text
    <div className="min-h-screen bg-white text-black mos-dashboard flex flex-col">
      {/* Use memoized header component with memoized props */}
      <MemoizedHeader {...headerProps} />

      {/* Main Content Area below header */}
      <div className="flex-grow flex flex-col">
        {/* Use memoized issue banner with memoized props */}
        {issueBannerProps && <MemoizedIssueBanner {...issueBannerProps} />}

        {/* Two Panel Layout takes remaining height */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-0 mos-dashboard-grid">
          {/* Left Panel - Network Graph - use memoized component */}
          <div className="network-graph-container border-r border-gray-200 p-4">
            {networkGraphProps && <MemoizedNetworkGraph {...networkGraphProps} />}
          </div>

          {/* Right Panel - Route Details - use memoized component */}
          <div className="route-detail-container overflow-y-auto">
            {isRouteLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : dashboardData?.selectedRoute && routeDetailProps ? (
              <MemoizedRouteDetailPanel {...routeDetailProps} />
            ) : (
              <div className="h-full flex items-center justify-center text-black">
                <div className="text-center text-gray-500">
                  <p className="text-lg mb-4">
                    Select a route on the network graph to view details
                  </p>
                  <p className="text-gray-400">
                    Click on any connection line or destination node
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MOSDashboard;
