import DashboardErrorState from "components/common/DashboardErrorState";
import { useState, useEffect, useRef, useMemo, memo } from "react";
import { useMOSDashboardData } from "hooks/useMOSDashboardData";

import NetworkGraphPanel from "components/mos/NetworkGraphPanel";
import IssueDetailsBanner from "components/mos/IssueDetailsBanner";

const NetworkGraphPage: React.FC = () => {
  const [containerSize, setContainerSize] = useState({
    width: 600,
    height: 400,
  });
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setContainerSize({
          width: clientWidth * 0.7,
          height: clientHeight * 0.7,
        });
      }
    };

    updateSize();

    window.addEventListener("resize", updateSize);
  }, [containerRef]);

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

  console.log("containerSize", containerSize.height, containerSize.width);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center w-full h-full p-4 bg-[#ffffff]"
    >
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
