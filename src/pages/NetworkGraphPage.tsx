import DashboardErrorState from "components/common/DashboardErrorState";
import { useMemo } from "react";
import { useMOSDashboardData } from "hooks/useMOSDashboardData";

import NetworkGraphPanel from "components/mos/NetworkGraphPanel";
import IssueDetailsBanner from "components/mos/IssueDetailsBanner";

const NetworkGraphPage: React.FC = () => {
  const {
    dashboardData,
    error,
    selectedRouteId,
    selectedSourceId,
    availableLocationNames,
    selectRoute,
    changeSourceLocation,
    locationsMap,
    retryFetch,
  } = useMOSDashboardData();

  const issueBannerProps = useMemo(() => {
    if (!dashboardData?.issueDetails) return null;
    return {
      mainNode: locationsMap[selectedSourceId]?.name || selectedSourceId,
      degradationPercentage: dashboardData.issueDetails.degradationPercentage,
      application: dashboardData.issueDetails.application,
      vlan: dashboardData.issueDetails.vlan,
      codec: dashboardData.issueDetails.codec,
      availableLocations: availableLocationNames,
      onLocationChange: (locationName: string) => {
        const location = Object.values(locationsMap).find(
          (loc) => loc.name === locationName
        );
        if (location) {
          changeSourceLocation(location.id);
        }
      },
    };
  }, [
    dashboardData?.issueDetails,
    selectedSourceId,
    availableLocationNames,
    locationsMap,
    changeSourceLocation,
  ]);

  // Network Graph props
  const networkGraphProps = useMemo(() => {
    if (!dashboardData) return null;
    return {
      locations: dashboardData.locations,
      routes: dashboardData.routes,
      onRouteSelected: selectRoute,
      selectedRouteId,
      mainDegradationPercentage:
        dashboardData.issueDetails?.degradationPercentage || 0,
    };
  }, [dashboardData, selectedRouteId, selectRoute]);

  // Error handling
  if (error) {
    return <DashboardErrorState error={error} onRetry={retryFetch} />;
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
    <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-[#ffffff]">
      {issueBannerProps && (
        <div className="w-full">
          <IssueDetailsBanner {...issueBannerProps} />
        </div>
      )}
      {networkGraphProps && <NetworkGraphPanel {...networkGraphProps} />}
    </div>
  );
};
export default NetworkGraphPage;
