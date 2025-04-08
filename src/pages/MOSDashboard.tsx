import React, { useState, useEffect } from "react";
import { useMOSDashboardData } from "hooks/useMOSDashboardData";
import { Location } from "types/mos";
import MOSDashboardHeader from "components/mos/MOSDashboardHeader";
import IssueDetailsBanner from "components/mos/IssueDetailsBanner";
import NetworkGraphPanel from "components/mos/NetworkGraphPanel";
import RouteDetailPanel from "components/mos/RouteDetailPanel";

const MOSDashboard: React.FC = () => {
  const {
    dashboardData,
    isLoading,
    error,
    selectedRouteId,
    selectRoute,
  } = useMOSDashboardData();

  const [locationsMap, setLocationsMap] = useState<Record<string, Location>>(
    {},
  );

  useEffect(() => {
    if (dashboardData?.locations) {
      const map: Record<string, Location> = {};
      dashboardData.locations.forEach((location) => {
        map[location.id] = location;
      });
      setLocationsMap(map);
    }
  }, [dashboardData?.locations]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="p-8 text-center bg-white text-black">
        <div className="text-red-500 text-xl mb-4">
          Error loading dashboard data
        </div>
        <div className="text-gray-700">
          {error || "Unknown error occurred"}
        </div>
      </div>
    );
  }

  return (
    // Main container uses white background, black text
    <div className="min-h-screen bg-white text-black mos-dashboard flex flex-col">
      {/* Header takes full width */}
      <MOSDashboardHeader
        serviceName={dashboardData.serviceInfo.name}
        currentTime={dashboardData.serviceInfo.currentTime} // These times aren't used in the static header example
        startTime={dashboardData.serviceInfo.startTime} // but kept for potential future use
      />

      {/* Main Content Area below header */}
      <div className="flex-grow flex flex-col">
        {/* Issue Banner takes full width */}
        <IssueDetailsBanner
          mainNode={dashboardData.issueDetails.mainNode}
          degradationPercentage={
            dashboardData.issueDetails.degradationPercentage
          }
          application={dashboardData.issueDetails.application}
          vlan={dashboardData.issueDetails.vlan}
          codec={dashboardData.issueDetails.codec}
        />

        {/* Two Panel Layout takes remaining height */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-0 mos-dashboard-grid">
          {/* Left Panel - Network Graph */}
          {/* Added border-r for visual separation */}
          <div className="network-graph-container border-r border-gray-200 p-4">
            <NetworkGraphPanel
              locations={dashboardData.locations}
              routes={dashboardData.routes}
              onRouteSelected={selectRoute}
              selectedRouteId={selectedRouteId}
              // Pass the main degradation percentage
              mainDegradationPercentage={
                dashboardData.issueDetails.degradationPercentage
              }
            />
          </div>

          {/* Right Panel - Route Details */}
          {/* Removed fixed height, let it fill */}
          <div className="route-detail-container overflow-y-auto">
            {" "}
            {/* Added overflow-y-auto */}
            {dashboardData.selectedRoute ? (
              <RouteDetailPanel
                routeDetails={dashboardData.selectedRoute}
                historicalData={dashboardData.historicalData}
                sourceLocationName={
                  locationsMap[dashboardData.selectedRoute.sourceId]?.name ||
                  dashboardData.selectedRoute.sourceId
                }
                destinationLocationName={
                  locationsMap[dashboardData.selectedRoute.destinationId]
                    ?.name || dashboardData.selectedRoute.destinationId
                }
              />
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
