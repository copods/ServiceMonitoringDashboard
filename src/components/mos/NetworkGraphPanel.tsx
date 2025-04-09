import React, { useMemo, useCallback } from "react";
import * as d3 from "d3";
import { Location, Route } from "types/mos"; // Adjust path if needed

// --- Component Props Interface ---
interface NetworkGraphPanelProps {
  locations: Location[];
  routes: Route[];
  onRouteSelected: (routeId: string) => void;
  selectedRouteId: string | null;
  mainDegradationPercentage: number; // Added prop
}

// --- Constants for Layout and Styling ---
const SVG_WIDTH = "100%"; // Use relative width
const SVG_HEIGHT = 550; // Keep fixed height or adjust as needed
const NODE_RADIUS = 28; // Slightly smaller
const PROGRESS_RADIUS = 18; // Slightly smaller
const PADDING_Y = 55; // Adjust vertical spacing

const CENTRAL_NODE_X = 80; // Adjusted position
const CENTRAL_NODE_Y = SVG_HEIGHT / 2;

const PROGRESS_X = 240; // Adjusted position
const DEST_NODE_X = 400; // Adjusted position
const TEXT_OFFSET_X = 10; // Space between node/progress and text

// Colors to match UI
const DEFAULT_LINE_COLOR = "#cccccc";
const SELECTED_LINE_COLOR = "#2563eb"; // Brighter Blue for selected
const PROGRESS_HIGH_COLOR = "#dc2626"; // Red-600
const PROGRESS_LOW_COLOR = "#d1d5db"; // Gray-300
const PROGRESS_BG_COLOR = "#f3f4f6"; // Gray-100
const TEXT_COLOR = "#1f2937"; // Gray-800
const NODE_STROKE_COLOR = "#9ca3af"; // Gray-400
const SELECTED_NODE_STROKE_COLOR = "#2563eb"; // Brighter Blue

// --- D3 Arc Generators ---
const arcGenerator = d3
  .arc()
  .innerRadius(PROGRESS_RADIUS * 0.75) // Thinner arc
  .outerRadius(PROGRESS_RADIUS)
  .startAngle(0); // Start at 3 o'clock for easier percentage mapping

const backgroundArcGenerator = d3
  .arc()
  .innerRadius(PROGRESS_RADIUS * 0.75)
  .outerRadius(PROGRESS_RADIUS)
  .startAngle(0)
  .endAngle(2 * Math.PI); // Full circle

// --- Helper Functions ---
const getCurvePath = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): string => {
  const midX = startX + (endX - startX) / 2;
  // Control points adjusted for a slightly different curve shape
  const cp1X = startX + (midX - startX) * 0.8;
  const cp2X = midX + (endX - midX) * 0.2;
  return `M ${startX} ${startY} C ${cp1X} ${startY}, ${cp2X} ${endY}, ${endX} ${endY}`;
};

// Updated Icon Path Generator
const getIconPath = (
  cx: number,
  cy: number,
  radius: number,
  isCentral: boolean = false,
  isSelected: boolean = false,
): React.ReactNode => {
  const iconColor = isCentral || isSelected ? SELECTED_NODE_STROKE_COLOR : "#6b7280"; // Gray-500 default
  const dotRadius = radius * 0.08;
  const armLength = radius * 0.35;
  const dotSpacing = radius * 0.6; // Distance of dots from center

  // Central cross
  const cross = (
    <path
      d={`M ${cx - armLength} ${cy} H ${cx + armLength} M ${cx} ${
        cy - armLength
      } V ${cy + armLength}`}
      stroke={iconColor}
      strokeWidth="1.5"
      fill="none"
    />
  );

  // Dots arranged horizontally for the arrow-like look
  const dots = [];
  const numDots = 5; // Example: 5 dots including center
  const totalWidth = radius * 1.2; // Width spanned by dots
  const startX = cx - totalWidth / 2;

  for (let i = 0; i < numDots; i++) {
    const dotX = startX + (i * totalWidth) / (numDots - 1);
    // Central node dots are circular, destination dots are linear
    if (isCentral) {
      // Simple circular arrangement for central node
      const angle = (i / numDots) * 2 * Math.PI + Math.PI / 4; // Offset start angle
      dots.push(
        <circle
          key={`dot-${i}`}
          cx={cx + Math.cos(angle) * dotSpacing}
          cy={cy + Math.sin(angle) * dotSpacing}
          r={dotRadius}
          fill={iconColor}
        />,
      );
    } else {
      // Linear arrangement for destination nodes
      dots.push(
        <circle
          key={`dot-${i}`}
          cx={dotX}
          cy={cy} // Align dots horizontally
          r={dotRadius}
          fill={iconColor}
        />,
      );
    }
  }

  return (
    <g>
      {/* Render cross only for central node in this style */}
      {isCentral && cross}
      {/* Render dots for all */}
      {dots}
    </g>
  );
};

// --- The React Component ---
const NetworkGraphPanel: React.FC<NetworkGraphPanelProps> = ({
  locations,
  routes,
  onRouteSelected,
  selectedRouteId,
  mainDegradationPercentage, // Use the prop
}) => {
  // Optimize computation of sourceLocation
  const sourceLocation = useMemo(() => {
    if (!routes || routes.length === 0 || !locations) return null;
    const sourceId = routes[0].sourceId;
    return locations.find((loc) => loc.id === sourceId);
  }, [locations, routes]);
  
  // Create a function that returns a click handler for a specific route
  const createRouteClickHandler = useCallback((routeId: string) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent bubbling
      e.preventDefault(); // Prevent default
      // Use a setTimeout to ensure the DOM has time to update before the next render
      setTimeout(() => onRouteSelected(routeId), 0);
    };
  }, [onRouteSelected]);

  // Memoize route rendering logic to prevent recalculations on every render
  const routeElements = useMemo(() => {
    if (!routes || routes.length === 0 || !sourceLocation) return [];
    
    const totalDestinations = routes.length;
    const startY = (SVG_HEIGHT - (totalDestinations - 1) * PADDING_Y) / 2;
    
    return routes.map((route, index) => {
      const destinationLocation = locations.find(
        (loc) => loc.id === route.destinationId,
      );
      if (!destinationLocation) return null;

      const isSelected = route.id === selectedRouteId;
      const destY = startY + index * PADDING_Y;
      const progressY = destY;

      const lineColor = isSelected ? SELECTED_LINE_COLOR : DEFAULT_LINE_COLOR;
      const nodeStrokeColor = isSelected
        ? SELECTED_NODE_STROKE_COLOR
        : NODE_STROKE_COLOR;
      const nodeStrokeWidth = isSelected ? "1.5" : "1";
      const progressPercent = route.impactPercentage;
      const progressColor =
        progressPercent >= 50 ? PROGRESS_HIGH_COLOR : PROGRESS_LOW_COLOR;

      const endAngle = (progressPercent / 100) * 2 * Math.PI;
      const progressArcPath = arcGenerator({ endAngle } as any) ?? "";
      const backgroundArcPath = backgroundArcGenerator({} as any) ?? "";

      const linePathToProgress = getCurvePath(
        CENTRAL_NODE_X + NODE_RADIUS * 0.7,
        CENTRAL_NODE_Y,
        PROGRESS_X - PROGRESS_RADIUS,
        progressY,
      );
      const linePathToDest = getCurvePath(
        PROGRESS_X + PROGRESS_RADIUS,
        progressY,
        DEST_NODE_X - NODE_RADIUS,
        destY,
      );

      return (
        <g
          key={route.id}
          onClick={createRouteClickHandler(route.id)}
          style={{ cursor: "pointer" }}
          aria-label={`Route from ${sourceLocation.name} to ${destinationLocation.name}`}
        >
          {/* Connecting Lines */}
          <path
            d={linePathToProgress}
            stroke={lineColor}
            strokeWidth="1"
            fill="none"
          />
          <path
            d={linePathToDest}
            stroke={DEFAULT_LINE_COLOR}
            strokeWidth="1"
            fill="none"
          />

          {/* Progress Indicator */}
          <g transform={`translate(${PROGRESS_X}, ${progressY})`}>
            <path d={backgroundArcPath} fill={PROGRESS_BG_COLOR} />
            <path d={progressArcPath} fill={progressColor} />
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fontWeight="600"
              fill={TEXT_COLOR}
            >
              {progressPercent}%
            </text>
          </g>
          <text
            x={PROGRESS_X + PROGRESS_RADIUS + TEXT_OFFSET_X / 2}
            y={progressY}
            dominantBaseline="middle"
            fontSize="10"
            fill={TEXT_COLOR}
          >
            {Math.round(route.streamCount / 1000)}k streams
          </text>

          {/* Destination Node */}
          <g>
            <circle
              cx={DEST_NODE_X}
              cy={destY}
              r={NODE_RADIUS}
              fill="white"
              stroke={nodeStrokeColor}
              strokeWidth={nodeStrokeWidth}
            />
            {getIconPath(
              DEST_NODE_X,
              destY,
              NODE_RADIUS * 0.9,
              false,
              isSelected,
            )}
            <text
              x={DEST_NODE_X + NODE_RADIUS + TEXT_OFFSET_X}
              y={destY - 4}
              dominantBaseline="middle"
              fontWeight="600"
              fontSize="11"
              fill={TEXT_COLOR}
            >
              {destinationLocation.name}
            </text>
            <text
              x={DEST_NODE_X + NODE_RADIUS + TEXT_OFFSET_X}
              y={destY + 8}
              dominantBaseline="middle"
              fontSize="10"
              fill={TEXT_COLOR}
            >
              {route.mosPercentage}% Deg
            </text>
          </g>
        </g>
      );
    });
  }, [locations, routes, selectedRouteId, sourceLocation, createRouteClickHandler]); // Removed redundant onRouteSelected dependency

  // Memoize the central node to prevent recreation on every render
  const centralNode = useMemo(() => {
    if (!sourceLocation) return null;
    
    return (
      <g>
        <circle
          cx={CENTRAL_NODE_X}
          cy={CENTRAL_NODE_Y}
          r={NODE_RADIUS}
          fill="white"
          stroke={SELECTED_NODE_STROKE_COLOR} // Always blue outline for central
          strokeWidth="1.5"
        />
        {getIconPath(
          CENTRAL_NODE_X,
          CENTRAL_NODE_Y,
          NODE_RADIUS * 0.9, // Icon size relative to node
          true,
          true, // Always treat central as 'selected' for icon color
        )}
        <text
          x={CENTRAL_NODE_X}
          y={CENTRAL_NODE_Y + NODE_RADIUS + 12} // Position text closer
          textAnchor="middle"
          fontWeight="600" // Semibold
          fontSize="11" // Smaller font
          fill={TEXT_COLOR}
        >
          {sourceLocation.name}
        </text>
        <text
          x={CENTRAL_NODE_X}
          y={CENTRAL_NODE_Y + NODE_RADIUS + 24} // Position text below name
          textAnchor="middle"
          fontSize="10" // Even smaller font
          fill={TEXT_COLOR}
        >
          {mainDegradationPercentage}% MoS
        </text>
      </g>
    );
  }, [sourceLocation, mainDegradationPercentage]);

  return (
    <svg
      width={SVG_WIDTH}
      height={SVG_HEIGHT}
      viewBox={`0 0 ${500} ${SVG_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ fontFamily: "Arial, sans-serif", maxWidth: "500px" }}
    >
      {/* Central Node */}
      {centralNode}

      {/* Destination Nodes and Connections - use the memoized elements */}
      {routeElements}
    </svg>
  );
};

export default NetworkGraphPanel;
