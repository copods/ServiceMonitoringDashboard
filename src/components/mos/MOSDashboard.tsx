import React, { useState, useEffect } from 'react';
import { useMOSDashboardData } from '../../hooks/useMOSDashboardData';
import { Location } from '../../types/mos';
import MOSDashboardHeader from './MOSDashboardHeader';
import IssueDetailsBanner from './IssueDetailsBanner';
import NetworkGraphPanel from './NetworkGraphPanel';
import RouteDetailPanel from './RouteDetailPanel';

const MOSDashboard: React.FC = () => {
  const { 
    dashboardData, 
    isLoading, 
    error, 
    selectedRouteId, 
    selectRoute 
  } = useMOSDashboardData();

  // Map of locations by id for easy lookup
  const [locationsMap, setLocationsMap] = useState<Record<string, Location>>({});

  // Initialize locations map
  useEffect(() => {
    if (dashboardData?.locations) {
      const map: Record<string, Location> = {};
      dashboardData.locations.forEach(location => {
        map[location.id] = location;
      });
      setLocationsMap(map);
    }
  }, [dashboardData?.locations]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 text-xl mb-4">Error loading dashboard data</div>
        <div className="text-gray-700">{error || 'Unknown error occurred'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header Section */}
      <MOSDashboardHeader
        serviceName={dashboardData.serviceInfo.name}
        currentTime={dashboardData.serviceInfo.currentTime}
        startTime={dashboardData.serviceInfo.startTime}
      />

      {/* Issue Details Banner */}
      <IssueDetailsBanner
        mainNode={dashboardData.issueDetails.mainNode}
        degradationPercentage={dashboardData.issueDetails.degradationPercentage}
        application={dashboardData.issueDetails.application}
        vlan={dashboardData.issueDetails.vlan}
        codec={dashboardData.issueDetails.codec}
      />

      {/* Main Content Area - Two Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Left Panel - Network Graph */}
        <div className="h-[600px]">
          <NetworkGraphPanel
            locations={dashboardData.locations}
            routes={dashboardData.routes}
            onRouteSelected={selectRoute}
            selectedRouteId={selectedRouteId}
          />
        </div>

        {/* Right Panel - Route Details */}
        <div className="h-[600px] overflow-auto">
          {dashboardData.selectedRoute ? (
            <RouteDetailPanel
              routeDetails={dashboardData.selectedRoute}
              historicalData={dashboardData.historicalData}
              sourceLocationName={locationsMap[dashboardData.selectedRoute.sourceId]?.name || dashboardData.selectedRoute.sourceId}
              destinationLocationName={locationsMap[dashboardData.selectedRoute.destinationId]?.name || dashboardData.selectedRoute.destinationId}
            />
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-sm h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-4">Select a route on the network graph to view details</p>
                <p className="text-gray-400">Click on any connection line or destination node</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MOSDashboard;
