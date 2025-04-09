import React, { useMemo, useCallback, useRef, useEffect, useState } from "react";
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
// Fixed radius for nodes and progress indicators
const DENVER_NODE_RADIUS = 32; // Larger radius for Denver node
const NODE_RADIUS = 28; 
const PROGRESS_RADIUS = 18;

// Minimum vertical spacing between destination nodes
const MIN_VERTICAL_SPACING = 70; // Increased from previous calculation

// Colors to match UI
const DEFAULT_LINE_COLOR = "#cccccc";
const SELECTED_LINE_COLOR = "#0C6CA2"; // Brighter Blue for selected
const PROGRESS_HIGH_COLOR = "#dc2626"; // Red-600
const PROGRESS_LOW_COLOR = "#d1d5db"; // Gray-300
const PROGRESS_BG_COLOR = "#f3f4f6"; // Gray-100
const TEXT_COLOR = "#1f2937"; // Gray-800
const NODE_STROKE_COLOR = "#9ca3af"; // Gray-400
const SELECTED_NODE_STROKE_COLOR = "#0C6CA2"; // Brighter Blue

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

// Updated Icon Path Generator with right-facing arrow pattern
const getIconPath = (
  cx: number,
  cy: number,
  radius: number,
  isDenver: boolean = false,
  isSelected: boolean = false,
): React.ReactNode => {
  const iconColor = isDenver || isSelected ? SELECTED_NODE_STROKE_COLOR : "#6b7280"; // Gray-500 default
  const dotRadius = radius * 0.08;
  
  // For all nodes, create a right-facing arrow exactly like the ASCII art
  // Right-facing arrow pattern based on this ASCII art:
  //     .
  //     ..
  // ........
  //     ..
  //     .
  
  // Calculate positions more precisely to match the ASCII art
  const dotSpacing = radius * 0.15; // Closer spacing for a compact arrow
  
  return (
    <g>
      {/* Middle horizontal line - 7 dots in a row (removed the rightmost one) */}
      <circle cx={cx - dotSpacing*3.5} cy={cy} r={dotRadius} fill={iconColor} />
      <circle cx={cx - dotSpacing*2.5} cy={cy} r={dotRadius} fill={iconColor} />
      <circle cx={cx - dotSpacing*1.5} cy={cy} r={dotRadius} fill={iconColor} />
      <circle cx={cx - dotSpacing*0.5} cy={cy} r={dotRadius} fill={iconColor} />
      <circle cx={cx + dotSpacing*0.5} cy={cy} r={dotRadius} fill={iconColor} />
      <circle cx={cx + dotSpacing*1.5} cy={cy} r={dotRadius} fill={iconColor} />
      <circle cx={cx + dotSpacing*2.5} cy={cy} r={dotRadius} fill={iconColor} />
      
      {/* Second row up - 2 dots */}
      <circle cx={cx} cy={cy - dotSpacing} r={dotRadius} fill={iconColor} />
      <circle cx={cx + dotSpacing} cy={cy - dotSpacing} r={dotRadius} fill={iconColor} />
      
      {/* Top row - 1 dot */}
      <circle cx={cx} cy={cy - dotSpacing*2} r={dotRadius} fill={iconColor} />
      
      {/* Second row down - 2 dots */}
      <circle cx={cx} cy={cy + dotSpacing} r={dotRadius} fill={iconColor} />
      <circle cx={cx + dotSpacing} cy={cy + dotSpacing} r={dotRadius} fill={iconColor} />
      
      {/* Bottom row - 1 dot */}
      <circle cx={cx} cy={cy + dotSpacing*2} r={dotRadius} fill={iconColor} />
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
  // Add a ref to the container element to measure its dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [layoutPositions, setLayoutPositions] = useState({
    centralNodeX: 80,
    progressX: 240,
    destNodeX: 400,
    textOffsetX: 10,
    svgHeight: 550,
    centralNodeY: 275,
    paddingY: MIN_VERTICAL_SPACING
  });

  // Effect to measure container dimensions and update positions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        setContainerDimensions({ width, height });
        
        // Calculate responsive positions based on container dimensions
        // These are relative positions that scale with the container
        const centralX = Math.max(80, width * 0.15); // 15% from the left
        const progressX = Math.max(240, width * 0.45); // 45% from the left
        const destX = Math.max(400, width * 0.75); // 75% from the left
        const textOffset = Math.max(10, width * 0.02); // 2% of width for text offset
        
        // Calculate vertical spacing based on container height and number of routes
        const routeCount = routes.length || 1;
        const calculatedHeight = Math.max(550, height); // Minimum height of 550px
        const centralY = calculatedHeight / 2;
        
        // Enhanced padding calculation that ensures minimum spacing between nodes
        // Calculate available height for all routes
        const availableHeight = calculatedHeight * 0.6; // Use 60% of available height
        
        // Calculate required space for all routes with minimum spacing
        const minRequiredHeight = (routeCount - 1) * MIN_VERTICAL_SPACING;
        
        // If there's enough room, distribute evenly; otherwise, use minimum spacing
        let calculatedPaddingY;
        
        if (availableHeight >= minRequiredHeight && routeCount > 1) {
          // If there's enough space, distribute routes evenly
          calculatedPaddingY = availableHeight / (routeCount - 1);
        } else {
          // If there's not enough space or only one route, use minimum spacing
          calculatedPaddingY = MIN_VERTICAL_SPACING;
        }
        
        // Cap the padding to reasonable values
        calculatedPaddingY = Math.min(Math.max(calculatedPaddingY, MIN_VERTICAL_SPACING), 100);
        
        setLayoutPositions({
          centralNodeX: centralX,
          progressX: progressX,
          destNodeX: destX,
          textOffsetX: textOffset,
          svgHeight: calculatedHeight,
          centralNodeY: centralY,
          paddingY: calculatedPaddingY
        });
      }
    };

    // Initial update
    updateDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateDimensions);
  }, [routes.length]);

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
    if (!routes || routes.length === 0 || !sourceLocation || containerDimensions.width === 0) return [];
    
    const { 
      centralNodeX, 
      progressX, 
      destNodeX, 
      textOffsetX, 
      centralNodeY, 
      paddingY 
    } = layoutPositions;
    
    const totalDestinations = routes.length;
    
    // Calculate total height needed for all routes
    const totalRouteHeight = (totalDestinations - 1) * paddingY;
    
    // Calculate start Y position to center the routes vertically
    const startY = centralNodeY - totalRouteHeight / 2;
    
    return routes.map((route, index) => {
      const destinationLocation = locations.find(
        (loc) => loc.id === route.destinationId,
      );
      if (!destinationLocation) return null;

      const isSelected = route.id === selectedRouteId;
      const destY = startY + index * paddingY;
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
        centralNodeX + DENVER_NODE_RADIUS, // Start exactly at the edge of the Denver node circle
        centralNodeY,
        progressX - PROGRESS_RADIUS,
        progressY,
      );
      const linePathToDest = getCurvePath(
        progressX + PROGRESS_RADIUS,
        progressY,
        destNodeX - NODE_RADIUS,
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
            stroke={lineColor}
            strokeWidth="1"
            fill="none"
          />

          {/* Progress Indicator */}
          <g transform={`translate(${progressX}, ${progressY})`}>
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
          
          {/* Streams text - Positioned above the connecting line */}
          <text
            x={progressX + PROGRESS_RADIUS + textOffsetX / 2}
            y={progressY - 12} // Move up by 12 pixels to place above the line
            dominantBaseline="middle"
            fontSize="10"
            fill={TEXT_COLOR}
          >
            {Math.round(route.streamCount / 1000)}k streams
          </text>

          {/* Destination Node */}
          <g>
            <circle
              cx={destNodeX}
              cy={destY}
              r={NODE_RADIUS}
              fill="white"
              stroke={nodeStrokeColor}
              strokeWidth={nodeStrokeWidth}
            />
            {getIconPath(
              destNodeX,
              destY,
              NODE_RADIUS * 0.9,
              false,
              isSelected,
            )}
            <text
              x={destNodeX + NODE_RADIUS + textOffsetX}
              y={destY - 4}
              dominantBaseline="middle"
              fontWeight="600"
              fontSize="11"
              fill={TEXT_COLOR}
            >
              {destinationLocation.name}
            </text>
            <text
              x={destNodeX + NODE_RADIUS + textOffsetX}
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
  }, [locations, routes, selectedRouteId, sourceLocation, createRouteClickHandler, containerDimensions.width, layoutPositions]);

  // Memoize the central node to prevent recreation on every render
  const centralNode = useMemo(() => {
    if (!sourceLocation || containerDimensions.width === 0) return null;
    
    const { centralNodeX, centralNodeY } = layoutPositions;
    
    return (
      <g>
        <circle
          cx={centralNodeX}
          cy={centralNodeY}
          r={DENVER_NODE_RADIUS}
          fill="white"
          stroke={SELECTED_NODE_STROKE_COLOR} // Always blue outline for central
          strokeWidth="1.5"
        />
        {getIconPath(
          centralNodeX,
          centralNodeY,
          DENVER_NODE_RADIUS * 0.9, // Icon size relative to node
          true,
          true, // Always treat central as 'selected' for icon color
        )}
        <text
          x={centralNodeX}
          y={centralNodeY + DENVER_NODE_RADIUS + 12} // Position text closer
          textAnchor="middle"
          fontWeight="600" // Semibold
          fontSize="11" // Smaller font
          fill={TEXT_COLOR}
        >
          {sourceLocation.name}
        </text>
        <text
          x={centralNodeX}
          y={centralNodeY + DENVER_NODE_RADIUS + 24} // Position text below name
          textAnchor="middle"
          fontSize="10" // Even smaller font
          fill={TEXT_COLOR}
        >
          {mainDegradationPercentage}% MoS
        </text>
      </g>
    );
  }, [sourceLocation, mainDegradationPercentage, containerDimensions.width, layoutPositions]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg
        width="100%"
        height="100%" 
        preserveAspectRatio="xMidYMid meet"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Central Node */}
        {centralNode}

        {/* Destination Nodes and Connections - use the memoized elements */}
        {routeElements}
      </svg>
    </div>
  );
};

export default NetworkGraphPanel;