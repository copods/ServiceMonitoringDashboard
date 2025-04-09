import React, { useMemo, useCallback } from "react"; // Import useCallback
import { RouteDetails, HistoricalData } from "types/mos"; // Adjust path
import RouteHistoricalChart from "./RouteHistoricalChart"; // Adjust path
import SvgIcon from "components/common/SvgIcon"; // Import SvgIcon

interface RouteDetailPanelProps {
  routeDetails: RouteDetails;
  historicalData: HistoricalData[];
  sourceLocationName: string;
  destinationLocationName: string;
}

// Simple Icon Placeholder
const NodeIcon = () => (
  <div className="w-8 h-8 bg-white rounded-full border border-gray-300 flex items-center justify-center">
    <svg viewBox="0 0 16 16" width="12" height="12">
      {/* Simplified icon representation */}
      <circle cx="8" cy="8" r="1.5" fill="#6b7280" />
      <circle cx="12" cy="8" r="1.5" fill="#6b7280" />
      <circle cx="4" cy="8" r="1.5" fill="#6b7280" />
      <circle cx="8" cy="12" r="1.5" fill="#6b7280" />
      <circle cx="8" cy="4" r="1.5" fill="#6b7280" />
    </svg>
  </div>
);

// Removed local Arrow and Download Icon definitions

const RouteDetailPanel: React.FC<RouteDetailPanelProps> = ({
  routeDetails,
  historicalData,
  sourceLocationName,
  destinationLocationName,
}) => {
  const { forwardPath, returnPath, analysis, additionalStats } = routeDetails;

  // Helper to determine MOS color (example thresholds) - wrapped in useCallback
  const getMosColor = useCallback((mos: number): string => {
    if (mos < 40) return "text-red-600";
    if (mos < 70) return "text-yellow-600";
    return "text-green-600"; // Or blue like the original? Let's use green for good MOS
  }, []); // Empty dependency array as it doesn't depend on props/state

  // Helper to determine Packet Loss color - wrapped in useCallback
  const getPlColor = useCallback((pl: number): string => {
    if (pl > 10) return "text-red-600";
    if (pl > 2) return "text-yellow-600";
    return "text-gray-700"; // Low PL is good, less emphasis
  }, []); // Empty dependency array

  // Impact color based on percentage - wrapped in useCallback
  const getImpactColor = useCallback((impact: number): string => {
    return impact > 50 ? "bg-red-500" : "bg-yellow-400"; // Red for high impact, yellow for lower
  }, []); // Empty dependency array

  // Memoize sections to prevent re-rendering on parent re-renders
  // Use the memoized functions (getMosColor, getPlColor, getImpactColor) in dependencies
  const forwardPathSection = useMemo(() => (
    <div className="flex items-center justify-between space-x-2">
      {/* Source Stats */}
      <div className="flex items-center space-x-2 flex-none w-1/4">
        <NodeIcon />
        <div className="text-xs leading-tight">
          <div className={getMosColor(forwardPath.mosPercentage)}>
            {forwardPath.mosPercentage}% MOS
          </div>
          <div className={getPlColor(forwardPath.packetLossPercentage)}>
            {forwardPath.packetLossPercentage.toFixed(1)}% PL
          </div>
        </div>
      </div>

      {/* Connection Details */}
      <div className="flex flex-col items-center flex-grow mx-2">
        <div className="text-xs text-gray-500 mb-1">
          {Math.round(forwardPath.streamCount / 1000)}k streams
        </div>
        {/* Dashed Line */}
        <div className="w-full border-t border-dashed border-gray-400 relative">
          <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
            <SvgIcon name="arrow-right" size={20} stroke="#9ca3af" strokeWidth={1.5} />
          </div>
        </div>
        {/* Impact Arc/Circle (Simplified as text for now) */}
        <div className="mt-1 text-xs font-semibold text-red-600">
          {forwardPath.impactPercentage}% Impacted
        </div>
        {/* Progress Circle (visual representation) */}
        <div className="mt-1 w-5 h-5 rounded-full border border-gray-300 bg-gray-100 relative overflow-hidden">
           <div
             className={`absolute top-0 left-0 h-full ${getImpactColor(forwardPath.impactPercentage)}`}
             style={{ width: `${forwardPath.impactPercentage}%` }} // Simple bar inside circle
           ></div>
        </div>
      </div>

      {/* Destination Stats */}
      <div className="flex items-center justify-end space-x-2 flex-none w-1/4 text-right">
        <div className="text-xs leading-tight">
          {/* Destination MOS/PL from additionalStats */}
          <div className={getMosColor(additionalStats.destinationMOS)}>
            {additionalStats.destinationMOS}% MOS
          </div>
          <div className={getPlColor(additionalStats.destinationPacketLoss)}>
            {additionalStats.destinationPacketLoss.toFixed(1)}% PL
          </div>
        </div>
        <NodeIcon />
      </div>
    </div>
  ), [forwardPath, additionalStats, getMosColor, getPlColor, getImpactColor]); // Dependencies now include stable function references

  const returnPathSection = useMemo(() => (
    <div className="flex items-center justify-between space-x-2">
      {/* Destination Stats (Now acting as source for return) */}
       <div className="flex items-center space-x-2 flex-none w-1/4">
         <NodeIcon />
         <div className="text-xs leading-tight">
           <div className={getMosColor(additionalStats.destinationMOS)}>
             {additionalStats.destinationMOS}% MOS
           </div>
           <div className={getPlColor(additionalStats.destinationPacketLoss)}>
             {additionalStats.destinationPacketLoss.toFixed(1)}% PL
           </div>
         </div>
       </div>

      {/* Connection Details (Return) */}
      <div className="flex flex-col items-center flex-grow mx-2">
        <div className="text-xs text-gray-500 mb-1">
          {Math.round(returnPath.streamCount / 1000)}k streams
        </div>
        {/* Dashed Line */}
        <div className="w-full border-t border-dashed border-gray-400 relative">
          <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
            <SvgIcon name="arrow-left" size={20} stroke="#9ca3af" strokeWidth={1.5} />
          </div>
        </div>
        {/* Impact Arc/Circle (Simplified as text for now) */}
        <div className="mt-1 text-xs font-semibold text-yellow-600">
          {returnPath.impactPercentage}% Impacted
        </div>
         {/* Progress Circle (visual representation) */}
         <div className="mt-1 w-5 h-5 rounded-full border border-gray-300 bg-gray-100 relative overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full ${getImpactColor(returnPath.impactPercentage)}`}
              style={{ width: `${returnPath.impactPercentage}%` }} // Simple bar inside circle
            ></div>
         </div>
      </div>

      {/* Source Stats (Now acting as destination for return) */}
      <div className="flex items-center justify-end space-x-2 flex-none w-1/4 text-right">
        <div className="text-xs leading-tight">
          <div className={getMosColor(additionalStats.sourceMOS)}>
            {additionalStats.sourceMOS}% MOS
          </div>
          <div className={getPlColor(additionalStats.sourcePacketLoss)}>
            {additionalStats.sourcePacketLoss.toFixed(1)}% PL
          </div>
        </div>
        <NodeIcon />
      </div>
    </div>
  ), [returnPath, additionalStats, getMosColor, getPlColor, getImpactColor]); // Dependencies now include stable function references

  const analysisSection = useMemo(() => (
    <div className="border-t border-gray-200 pt-3">
      {/* Title omitted as per screenshot */}
      <div className="text-xs text-gray-600 space-y-1">
        <p>
          {analysis.impactedStreamsPercentage}% of streams reaching{" "}
          {destinationLocationName} are impacted. Out of all the streams that
          reach {destinationLocationName},{" "}
          {analysis.sourceToDestPercentage}% come from {sourceLocationName}.
        </p>
        <p>{analysis.overlapAnalysis}</p>
      </div>
    </div>
  ), [analysis, sourceLocationName, destinationLocationName]);

  return (
    // White background, black text, full height, padding
    <div className="bg-white text-black h-full p-4 space-y-4">
      {/* Title Section */}
      <div className="border-b border-gray-200 pb-2">
        <h2 className="text-base font-semibold text-gray-800">
          {sourceLocationName} to {destinationLocationName}
        </h2>
      </div>

      {/* Forward/Return Path Section */}
      <div className="space-y-5">
        {/* Use memoized sections instead of repeated JSX */}
        {forwardPathSection}
        {returnPathSection}
      </div>

      {/* Analysis Section */}
      {analysisSection}

      {/* Additional Statistics Section */}
      <div className="border-t border-gray-200 pt-3 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-800">
            Additional Statistics
          </h3>
          {/* Tab-like buttons */}
          <div className="flex space-x-1 border border-gray-300 rounded p-0.5">
             <button className="px-3 py-1 text-xs text-gray-700 bg-white rounded-sm focus:outline-none">
               Overtime View
             </button>
             {/* Add other tabs if needed */}
           </div>
        </div>

        {/* Chart Area */}
        <div className="border border-gray-200 rounded p-3">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-medium text-gray-700">
              {sourceLocationName} &gt; {destinationLocationName}
            </h4>
            <button className="text-gray-500 hover:text-black">
              <SvgIcon name="download" size={16} />
            </button>
          </div>
          {/* Fixed height container for the chart */}
          <div className="h-48">
            {" "}
            {/* Adjusted height */}
            <RouteHistoricalChart data={historicalData} />
          </div>
        </div>

        {/* Stat Boxes */}
        {/* Removed grid, using flex for potential wrapping if needed */}
        {/* <div className="grid grid-cols-4 gap-2"> */}
        {/* Stat boxes removed as they are redundant with the forward/return path display above */}
        {/* </div> */}
      </div>
    </div>
  );
};

export default RouteDetailPanel;
