import React, { useMemo } from "react";
import { RouteDetails, HistoricalData } from "types/mos"; // Adjust path
import RouteHistoricalChart from "./RouteHistoricalChart"; // Adjust path
import SvgIcon from "components/common/SvgIcon"; // Import SvgIcon

interface RouteDetailPanelProps {
  routeDetails: RouteDetails;
  historicalData: HistoricalData[];
  isHistoricalDataLoading?: boolean; // Add this line for loading state
  sourceLocationName: string;
  destinationLocationName: string;
}

// --- ArrowPatternNodeIcon Component (Unchanged) ---
const ArrowPatternNodeIcon: React.FC<{
  size?: number;
  direction?: "left" | "right";
}> = ({ size = 48, direction = "right" }) => {
  const radius = size / 2;
  const cx = radius;
  const cy = radius;
  const iconColor = "#6b7280";
  const dotRadius = radius * 0.08;
  const dotSpacing = radius * 0.15;
  const dirMultiplier = direction === "left" ? -1 : 1;
  const x = (offset: number) => cx + offset * dirMultiplier;

  return (
    <div
      className="flex-shrink-0 rounded-full bg-white border border-gray-400"
      style={{ width: size, height: size }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <g>
          <circle
            cx={x(-dotSpacing * 3.5)}
            cy={cy}
            r={dotRadius}
            fill={iconColor}
          />
          <circle
            cx={x(-dotSpacing * 2.5)}
            cy={cy}
            r={dotRadius}
            fill={iconColor}
          />
          <circle
            cx={x(-dotSpacing * 1.5)}
            cy={cy}
            r={dotRadius}
            fill={iconColor}
          />
          <circle
            cx={x(-dotSpacing * 0.5)}
            cy={cy}
            r={dotRadius}
            fill={iconColor}
          />
          <circle
            cx={x(dotSpacing * 0.5)}
            cy={cy}
            r={dotRadius}
            fill={iconColor}
          />
          <circle
            cx={x(dotSpacing * 1.5)}
            cy={cy}
            r={dotRadius}
            fill={iconColor}
          />
          <circle
            cx={x(dotSpacing * 2.5)}
            cy={cy}
            r={dotRadius}
            fill={iconColor}
          />
          <circle
            cx={x(0)}
            cy={cy - dotSpacing}
            r={dotRadius}
            fill={iconColor}
          />
          <circle
            cx={x(dotSpacing)}
            cy={cy - dotSpacing}
            r={dotRadius}
            fill={iconColor}
          />
          <circle
            cx={x(0)}
            cy={cy - dotSpacing * 2}
            r={dotRadius}
            fill={iconColor}
          />
          <circle
            cx={x(0)}
            cy={cy + dotSpacing}
            r={dotRadius}
            fill={iconColor}
          />
          <circle
            cx={x(dotSpacing)}
            cy={cy + dotSpacing}
            r={dotRadius}
            fill={iconColor}
          />
          <circle
            cx={x(0)}
            cy={cy + dotSpacing * 2}
            r={dotRadius}
            fill={iconColor}
          />
        </g>
      </svg>
    </div>
  );
};

// --- Progress Indicator Circle (Modified with animation) ---
const ProgressIndicator: React.FC<{ percentage: number; size?: number }> = ({
  percentage,
  size = 42,
}) => {
  const [currentPercentage, setCurrentPercentage] = React.useState(0);
  const radius = size / 2;
  const circumference = 2 * Math.PI * (radius - 2);
  const offset = circumference - (currentPercentage / 100) * circumference;
  const color = "#B52216";

  React.useEffect(() => {
    // Reset to 0 when percentage changes
    setCurrentPercentage(0);

    // Start animation after a small delay
    const timer = setTimeout(() => {
      setCurrentPercentage(percentage);
    }, 100);

    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        className="absolute"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={radius}
          cy={radius}
          r={radius - 2}
          fill="transparent"
          stroke="#f3f4f6"
          strokeWidth="3"
        />
        <circle
          cx={radius}
          cy={radius}
          r={radius - 2}
          fill="transparent"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${radius} ${radius})`}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 2s ease-in-out",
          }}
        />
      </svg>
      <div className="absolute text-xs font-semibold">
        {Math.round(currentPercentage)}%
      </div>
    </div>
  );
};

const RouteDetailPanel: React.FC<RouteDetailPanelProps> = ({
  routeDetails,
  historicalData,
  isHistoricalDataLoading = false, // Add default value
  sourceLocationName,
  destinationLocationName,
}) => {
  const { forwardPath, returnPath, analysis, additionalStats } = routeDetails;

  // --- Memoized Sections (Unchanged) ---
  const forwardPathSection = useMemo(
    () => (
      <div className="flex items-center justify-between space-x-2">
        {/* Start: Text + Node */}
        <div className="flex items-center space-x-2 flex-none w-[120px]">
          {/* Added whitespace-nowrap */}
          <div className="text-xs leading-tight text-left text-black whitespace-nowrap">
            <div className="font-semibold">
              {forwardPath.mosPercentage}% MoS
            </div>
            <div>{forwardPath.packetLossPercentage.toFixed(1)}% PL</div>
          </div>
          <ArrowPatternNodeIcon />
        </div>

        {/* Center: Connection Details (Adjusted Text Position) */}
        <div className="flex items-center flex-grow mx-1 h-12">
          {/* Left Line + Streams Text */}
          <div className="flex-grow h-full relative">
            <div className="absolute bottom-[calc(50%-0.5px)] left-0 w-full border-t border-dashed border-gray-400 h-[1px]"></div>
            {/* Positioned near right end */}
            <div className="absolute bottom-[calc(50%+4px)] right-2 text-[10px] text-black whitespace-nowrap bg-white px-1">
              {Math.round(forwardPath.streamCount / 1000)}k streams
            </div>
          </div>

          <ProgressIndicator percentage={forwardPath.impactPercentage} />

          {/* Right Line + Impacted Text */}
          <div className="flex-grow h-full relative">
            <div className="absolute bottom-[calc(50%-0.5px)] left-0 w-full border-t border-dashed border-gray-400 h-[1px]"></div>
            {/* Positioned near left end */}
            <div className="absolute bottom-[calc(50%+4px)] left-2 text-[10px] font-semibold text-black whitespace-nowrap bg-white px-1">
              {forwardPath.impactPercentage}% Impacted
            </div>
          </div>
        </div>

        {/* End: Node + Text */}
        <div className="flex items-center justify-end space-x-2 flex-none w-[120px]">
          <ArrowPatternNodeIcon />
          {/* Added whitespace-nowrap */}
          <div className="text-xs leading-tight text-right text-black whitespace-nowrap">
            <div className="font-semibold">
              {additionalStats.destinationMOS}% MoS
            </div>
            <div>{additionalStats.destinationPacketLoss.toFixed(1)}% PL</div>
          </div>
        </div>
      </div>
    ),
    [forwardPath, additionalStats]
  );

  const returnPathSection = useMemo(
    () => (
      <div className="flex items-center justify-between space-x-2">
        {/* Start: Text + Node */}
        <div className="flex items-center space-x-2 flex-none w-[120px]">
          {/* Added whitespace-nowrap */}
          <div className="text-xs leading-tight text-left text-black whitespace-nowrap">
            <div className="font-semibold">
              {additionalStats.destinationMOS}% MoS
            </div>
            <div>{additionalStats.destinationPacketLoss.toFixed(1)}% PL</div>
          </div>
          <ArrowPatternNodeIcon direction="left" />
        </div>

        {/* Center: Connection Details (Return - Adjusted Text Position) */}
        <div className="flex items-center flex-grow mx-1 h-12">
          {/* Left Line + Streams Text */}
          <div className="flex-grow h-full relative">
            <div className="absolute bottom-[calc(50%-0.5px)] left-0 w-full border-t border-dashed border-gray-400 h-[1px]"></div>
            {/* Positioned near right end */}
            <div className="absolute bottom-[calc(50%+4px)] right-2 text-[10px] text-black whitespace-nowrap bg-white px-1">
              {Math.round(returnPath.streamCount / 1000)}k streams
            </div>
          </div>

          <ProgressIndicator percentage={returnPath.impactPercentage} />

          {/* Right Line + Impacted Text */}
          <div className="flex-grow h-full relative">
            <div className="absolute bottom-[calc(50%-0.5px)] left-0 w-full border-t border-dashed border-gray-400 h-[1px]"></div>
            {/* Positioned near left end */}
            <div className="absolute bottom-[calc(50%+4px)] left-2 text-[10px] font-semibold text-black whitespace-nowrap bg-white px-1">
              {returnPath.impactPercentage}% Impacted
            </div>
          </div>
        </div>

        {/* End: Node + Text */}
        <div className="flex items-center justify-end space-x-2 flex-none w-[120px]">
          <ArrowPatternNodeIcon direction="left" />
          {/* Added whitespace-nowrap */}
          <div className="text-xs leading-tight text-right text-black whitespace-nowrap">
            <div className="font-semibold">
              {additionalStats.sourceMOS}% MoS
            </div>
            <div>{additionalStats.sourcePacketLoss.toFixed(1)}% PL</div>
          </div>
        </div>
      </div>
    ),
    [returnPath, additionalStats]
  );

  // --- Analysis Section (Unchanged) ---
  const analysisSection = useMemo(
    () => (
      <div className="pt-3">
        <div className="text-xs text-gray-600 space-y-1 leading-relaxed">
          <p>
            {analysis.impactedStreamsPercentage}% of streams reaching{" "}
            {destinationLocationName} are impacted. Out of all the streams that
            reach {destinationLocationName}, {analysis.sourceToDestPercentage}%
            come from {sourceLocationName}.
          </p>
          <p>{analysis.overlapAnalysis}</p>
        </div>
      </div>
    ),
    [analysis, sourceLocationName, destinationLocationName]
  );

  // --- Return JSX (Only chart section modified) ---
  return (
    <div className="bg-white text-black h-full flex flex-col">
      {/* Title Section */}
      <div className="bg-[#F0F0F0] p-3 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-sm font-semibold text-gray-800">
          {sourceLocationName} to {destinationLocationName}
        </h2>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {/* Bordered Container */}
        <div className="border border-gray-300 rounded p-4 space-y-5">
          {forwardPathSection}
          {returnPathSection}
          {analysisSection}
        </div>

        {/* Additional Statistics Section */}
        <div className="pt-3 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-800">
              Additional Statistics
            </h3>
            <div className="flex space-x-1 border border-gray-300 rounded p-0.5">
              <button className="px-3 py-1 text-xs text-gray-700 bg-white rounded-sm focus:outline-none ring-1 ring-inset ring-blue-500">
                Overtime View
              </button>
            </div>
          </div>
          {/* Chart Area - Updated with loading state and fallback */}
          <div className="border border-gray-200 rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-medium text-gray-700">
                {sourceLocationName} &gt; {destinationLocationName}
              </h4>
              <button className="text-gray-500 hover:text-black">
                <SvgIcon name="download" size={16} />
              </button>
            </div>
            <div className="h-48 relative">
              {isHistoricalDataLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : historicalData.length > 0 ? (
                <RouteHistoricalChart data={historicalData} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No historical data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDetailPanel;
