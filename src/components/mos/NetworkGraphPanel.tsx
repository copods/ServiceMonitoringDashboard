import React, {
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
} from "react";
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
const DENVER_NODE_RADIUS = 32;
const NODE_RADIUS = 28;
const PROGRESS_RADIUS = 24; // Increased progress indicator radius

// Minimum vertical spacing between destination nodes
const MIN_VERTICAL_SPACING = 80;

// Colors to match UI
const DEFAULT_LINE_COLOR = "#cccccc";
const SELECTED_LINE_COLOR = "#0C6CA2";
const PROGRESS_HIGH_COLOR = "#B52216"; // Lighter Red
const PROGRESS_LOW_COLOR = "#C9C9C8"; // Updated Gray/Low Impact
const PROGRESS_BG_COLOR = "#f3f4f6"; // Background remains light gray
const TEXT_COLOR = "#1f2937"; // Default text color
const LEGEND_TEXT_COLOR = "#6b7280"; // Gray-500 for legend
const NODE_STROKE_COLOR = "#9ca3af";
const SELECTED_NODE_STROKE_COLOR = "#0C6CA2";

// --- D3 Arc Generators (Updated for new PROGRESS_RADIUS) ---
const arcGenerator = d3
  .arc()
  .innerRadius(PROGRESS_RADIUS * 0.75)
  .outerRadius(PROGRESS_RADIUS)
  .startAngle(0);

const backgroundArcGenerator = d3
  .arc()
  .innerRadius(PROGRESS_RADIUS * 0.75)
  .outerRadius(PROGRESS_RADIUS)
  .startAngle(0)
  .endAngle(2 * Math.PI);

// --- Helper Functions ---
const getCurvePath = (
  startX: number,
  startY: number,
  endX: number,
  endY: number
): string => {
  const midX = startX + (endX - startX) / 2;
  const cp1X = startX + (midX - startX) * 0.8;
  const cp2X = midX + (endX - midX) * 0.2;
  return `M ${startX} ${startY} C ${cp1X} ${startY}, ${cp2X} ${endY}, ${endX} ${endY}`;
};

// Icon Path Generator for Nodes (Unchanged)
const getIconPath = (
  cx: number,
  cy: number,
  radius: number,
  isDenver: boolean = false,
  isSelected: boolean = false
): React.ReactNode => {
  const iconColor =
    isDenver || isSelected ? SELECTED_NODE_STROKE_COLOR : "#6b7280";
  const dotRadius = radius * 0.08;
  const dotSpacing = radius * 0.15;

  return (
    <g>
      {/* Middle horizontal line */}
      <circle
        cx={cx - dotSpacing * 3.5}
        cy={cy}
        r={dotRadius}
        fill={iconColor}
      />
      <circle
        cx={cx - dotSpacing * 2.5}
        cy={cy}
        r={dotRadius}
        fill={iconColor}
      />
      <circle
        cx={cx - dotSpacing * 1.5}
        cy={cy}
        r={dotRadius}
        fill={iconColor}
      />
      <circle
        cx={cx - dotSpacing * 0.5}
        cy={cy}
        r={dotRadius}
        fill={iconColor}
      />
      <circle
        cx={cx + dotSpacing * 0.5}
        cy={cy}
        r={dotRadius}
        fill={iconColor}
      />
      <circle
        cx={cx + dotSpacing * 1.5}
        cy={cy}
        r={dotRadius}
        fill={iconColor}
      />
      <circle
        cx={cx + dotSpacing * 2.5}
        cy={cy}
        r={dotRadius}
        fill={iconColor}
      />
      {/* Second row up */}
      <circle cx={cx} cy={cy - dotSpacing} r={dotRadius} fill={iconColor} />
      <circle
        cx={cx + dotSpacing}
        cy={cy - dotSpacing}
        r={dotRadius}
        fill={iconColor}
      />
      {/* Top row */}
      <circle cx={cx} cy={cy - dotSpacing * 2} r={dotRadius} fill={iconColor} />
      {/* Second row down */}
      <circle cx={cx} cy={cy + dotSpacing} r={dotRadius} fill={iconColor} />
      <circle
        cx={cx + dotSpacing}
        cy={cy + dotSpacing}
        r={dotRadius}
        fill={iconColor}
      />
      {/* Bottom row */}
      <circle cx={cx} cy={cy + dotSpacing * 2} r={dotRadius} fill={iconColor} />
    </g>
  );
};

// --- Updated Legend Icon Generator (More Dots) ---
const getLegendIcon = (
  cx: number,
  cy: number,
  size: number, // This 'size' now defines the bounding area for the pattern
  direction: "left" | "right"
): React.ReactNode => {
  const iconColor = LEGEND_TEXT_COLOR; // Use legend color

  // Adjust dotRadius and dotSpacing relative to the desired pattern complexity within the size
  // These multipliers might need tweaking depending on the visual outcome with the given 'size'
  const dotRadius = size * 0.08; // Match getIconPath's relative dot size
  const dotSpacing = size * 0.15; // Match getIconPath's relative spacing

  const dirMultiplier = direction === "left" ? -1 : 1;
  const x = (offset: number) => cx + offset * dirMultiplier;

  // Replicate the more complex pattern from getIconPath
  return (
    <g>
      {/* Middle horizontal line - 7 dots */}
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
      <circle cx={x(dotSpacing * 0.5)} cy={cy} r={dotRadius} fill={iconColor} />
      <circle cx={x(dotSpacing * 1.5)} cy={cy} r={dotRadius} fill={iconColor} />
      <circle cx={x(dotSpacing * 2.5)} cy={cy} r={dotRadius} fill={iconColor} />

      {/* Second row up - 2 dots */}
      <circle cx={x(0)} cy={cy - dotSpacing} r={dotRadius} fill={iconColor} />
      <circle
        cx={x(dotSpacing)}
        cy={cy - dotSpacing}
        r={dotRadius}
        fill={iconColor}
      />

      {/* Top row - 1 dot */}
      <circle
        cx={x(0)}
        cy={cy - dotSpacing * 2}
        r={dotRadius}
        fill={iconColor}
      />

      {/* Second row down - 2 dots */}
      <circle cx={x(0)} cy={cy + dotSpacing} r={dotRadius} fill={iconColor} />
      <circle
        cx={x(dotSpacing)}
        cy={cy + dotSpacing}
        r={dotRadius}
        fill={iconColor}
      />

      {/* Bottom row - 1 dot */}
      <circle
        cx={x(0)}
        cy={cy + dotSpacing * 2}
        r={dotRadius}
        fill={iconColor}
      />
    </g>
  );
};

// --- The React Component ---
const NetworkGraphPanel: React.FC<NetworkGraphPanelProps> = ({
  locations,
  routes,
  onRouteSelected,
  selectedRouteId,
  mainDegradationPercentage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [layoutPositions, setLayoutPositions] = useState({
    centralNodeX: 80,
    progressX: 240,
    destNodeX: 400,
    textOffsetX: 18,
    svgHeight: 550,
    centralNodeY: 275,
    paddingY: MIN_VERTICAL_SPACING,
  });
  const [visibleNodes, setVisibleNodes] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);

  // Effect to handle node animations
  useEffect(() => {
    if (!routes || routes.length === 0 || isAnimating) return;

    setIsAnimating(true);
    const newVisibleNodes = new Set<string>();

    // First show the central node
    setTimeout(() => {
      newVisibleNodes.add("central");
      setVisibleNodes(new Set(newVisibleNodes));

      // Then show each route's nodes sequentially
      routes.forEach((route, index) => {
        setTimeout(() => {
          newVisibleNodes.add(route.id);
          setVisibleNodes(new Set(newVisibleNodes));
        }, (index + 1) * 150); // Increased delay between each route
      });
    }, 150); // Increased initial delay
  }, [routes, isAnimating]);

  // Effect to measure container dimensions and update positions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        setContainerDimensions({ width, height });

        const centralX = Math.max(80, width * 0.15);
        const progressX = Math.max(240, width * 0.45);
        const destX = Math.max(400, width * 0.75);
        const textOffset = Math.max(18, width * 0.035);

        const routeCount = routes.length || 1;
        // Adjusted minimum height slightly for potentially taller legend
        const calculatedHeight = Math.max(
          570,
          height,
          (routeCount + 1) * MIN_VERTICAL_SPACING
        );
        const centralY = calculatedHeight / 2;

        const availableHeight = calculatedHeight * 0.6;
        const minRequiredHeight = (routeCount - 1) * MIN_VERTICAL_SPACING;

        let calculatedPaddingY;
        if (availableHeight >= minRequiredHeight && routeCount > 1) {
          calculatedPaddingY = availableHeight / (routeCount - 1);
        } else {
          calculatedPaddingY = MIN_VERTICAL_SPACING;
        }
        calculatedPaddingY = Math.min(
          Math.max(calculatedPaddingY, MIN_VERTICAL_SPACING),
          110
        );

        setLayoutPositions({
          centralNodeX: centralX,
          progressX: progressX,
          destNodeX: destX,
          textOffsetX: textOffset,
          svgHeight: calculatedHeight,
          centralNodeY: centralY,
          paddingY: calculatedPaddingY,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [routes.length]);

  const sourceLocation = useMemo(() => {
    if (!routes || routes.length === 0 || !locations) return null;
    const sourceId = routes[0].sourceId;
    return locations.find((loc) => loc.id === sourceId);
  }, [locations, routes]);

  const createRouteClickHandler = useCallback(
    (routeId: string) => {
      return (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setTimeout(() => onRouteSelected(routeId), 0);
      };
    },
    [onRouteSelected]
  );

  // Memoize route rendering logic
  const routeElements = useMemo(() => {
    if (
      !routes ||
      routes.length === 0 ||
      !sourceLocation ||
      containerDimensions.width === 0
    )
      return [];

    const {
      centralNodeX,
      progressX,
      destNodeX,
      textOffsetX,
      centralNodeY,
      paddingY,
    } = layoutPositions;

    const totalDestinations = routes.length;
    const totalRouteHeight = (totalDestinations - 1) * paddingY;
    const startY = centralNodeY - totalRouteHeight / 2;

    return routes.map((route, index) => {
      const destinationLocation = locations.find(
        (loc) => loc.id === route.destinationId
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
        centralNodeX + DENVER_NODE_RADIUS,
        centralNodeY,
        progressX - PROGRESS_RADIUS,
        progressY
      );
      const linePathToDest = getCurvePath(
        progressX + PROGRESS_RADIUS,
        progressY,
        destNodeX - NODE_RADIUS,
        destY
      );

      const isVisible = visibleNodes.has(route.id);

      return (
        <g
          key={route.id}
          onClick={createRouteClickHandler(route.id)}
          style={{
            cursor: "pointer",
            opacity: isVisible ? 1 : 0,
            transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
            transform: isVisible ? "scale(1)" : "scale(0.95)",
          }}
          aria-label={`Route from ${sourceLocation.name} to ${destinationLocation.name}`}
        >
          {/* Connecting Lines */}
          <path
            d={linePathToProgress}
            stroke={lineColor}
            strokeWidth="1"
            fill="none"
            style={{
              transition: "stroke 0.25s ease-out",
              strokeDasharray: isVisible ? "none" : "5,5",
              strokeDashoffset: isVisible ? 0 : 10,
            }}
          />
          <path
            d={linePathToDest}
            stroke={lineColor}
            strokeWidth="1"
            fill="none"
            style={{
              transition: "stroke 0.25s ease-out",
              strokeDasharray: isVisible ? "none" : "5,5",
              strokeDashoffset: isVisible ? 0 : 10,
            }}
          />

          {/* Progress Indicator */}
          <g transform={`translate(${progressX}, ${progressY})`}>
            <path d={backgroundArcPath} fill={PROGRESS_BG_COLOR} />
            <path
              d={progressArcPath}
              fill={progressColor}
              style={{
                transition: "fill 0.25s ease-out",
                opacity: isVisible ? 1 : 0.7,
              }}
            />
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="13"
              fontWeight="600"
              fill={TEXT_COLOR}
              style={{
                transition: "opacity 0.25s ease-out",
                opacity: isVisible ? 1 : 0,
              }}
            >
              {progressPercent}%
            </text>
          </g>

          {/* Streams text */}
          <text
            x={progressX + PROGRESS_RADIUS + textOffsetX / 2}
            y={progressY - 18}
            dominantBaseline="middle"
            fontSize="12"
            fill={TEXT_COLOR}
            style={{
              transition: "opacity 0.25s ease-out",
              opacity: isVisible ? 1 : 0,
            }}
          >
            {Math.round(route.streamCount / 1000)}k streams
          </text>

          {/* Destination Node */}
          <g
            style={{
              transition: "transform 0.3s ease-out",
              transform: isVisible ? "scale(1)" : "scale(0.95)",
            }}
          >
            <circle
              cx={destNodeX}
              cy={destY}
              r={NODE_RADIUS}
              fill="white"
              stroke={nodeStrokeColor}
              strokeWidth={nodeStrokeWidth}
              style={{
                transition:
                  "stroke 0.25s ease-out, stroke-width 0.25s ease-out",
              }}
            />
            {getIconPath(
              destNodeX,
              destY,
              NODE_RADIUS * 0.9,
              false,
              isSelected
            )}
            <text
              x={destNodeX + NODE_RADIUS + textOffsetX}
              y={destY - 6}
              dominantBaseline="middle"
              fontWeight="600"
              fontSize="15"
              fill={TEXT_COLOR}
              style={{
                transition: "opacity 0.25s ease-out",
                opacity: isVisible ? 1 : 0,
              }}
            >
              {destinationLocation.name}
            </text>
            <text
              x={destNodeX + NODE_RADIUS + textOffsetX}
              y={destY + 12}
              dominantBaseline="middle"
              fontSize="14"
              fill={TEXT_COLOR}
              style={{
                transition: "opacity 0.25s ease-out",
                opacity: isVisible ? 1 : 0,
              }}
            >
              {route.mosPercentage}% Deg
            </text>
          </g>
        </g>
      );
    });
  }, [
    locations,
    routes,
    selectedRouteId,
    sourceLocation,
    createRouteClickHandler,
    containerDimensions.width,
    layoutPositions,
    visibleNodes,
  ]);

  // Memoize the central node
  const centralNode = useMemo(() => {
    if (!sourceLocation || containerDimensions.width === 0) return null;

    const { centralNodeX, centralNodeY } = layoutPositions;
    const isVisible = visibleNodes.has("central");
    const opacity = isVisible ? 1 : 0;

    return (
      <g
        style={{
          opacity,
          transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
          transform: isVisible ? "scale(1)" : "scale(0.95)",
        }}
      >
        <circle
          cx={centralNodeX}
          cy={centralNodeY}
          r={DENVER_NODE_RADIUS}
          fill="white"
          stroke={SELECTED_NODE_STROKE_COLOR}
          strokeWidth="1.5"
          style={{
            transition: "stroke 0.25s ease-out, stroke-width 0.25s ease-out",
          }}
        />
        {getIconPath(
          centralNodeX,
          centralNodeY,
          DENVER_NODE_RADIUS * 0.9,
          true,
          true
        )}
        <text
          x={centralNodeX}
          y={centralNodeY + DENVER_NODE_RADIUS + 16}
          textAnchor="middle"
          fontWeight="600"
          fontSize="15"
          fill={TEXT_COLOR}
          style={{
            transition: "opacity 0.25s ease-out",
            opacity: isVisible ? 1 : 0,
          }}
        >
          {sourceLocation.name}
        </text>
        <text
          x={centralNodeX}
          y={centralNodeY + DENVER_NODE_RADIUS + 32}
          textAnchor="middle"
          fontSize="14"
          fill={TEXT_COLOR}
          style={{
            transition: "opacity 0.25s ease-out",
            opacity: isVisible ? 1 : 0,
          }}
        >
          {mainDegradationPercentage}% MoS
        </text>
      </g>
    );
  }, [
    sourceLocation,
    mainDegradationPercentage,
    containerDimensions.width,
    layoutPositions,
    visibleNodes,
  ]);

  // --- Updated Legend Memo ---
  const legendElement = useMemo(() => {
    const legendY = layoutPositions.svgHeight - 30;
    const legendX = 40;
    const iconSize = 24;
    // textOffsetY is no longer needed for vertical alignment
    const spacing = 100;
    const textPadding = 8; // Horizontal padding between icon and text

    return (
      <g transform={`translate(${legendX}, ${legendY})`}>
        {/* Ingress Item */}
        <g>
          {/* Icon centered at (iconSize/2, 0) */}
          {getLegendIcon(iconSize / 2, 0, iconSize, "left")}
          <text
            x={iconSize + textPadding} // Position text after icon + padding
            y={0} // Align text's baseline to icon's center y
            dominantBaseline="middle" // Vertically center text relative to y
            fontSize="12"
            fill={LEGEND_TEXT_COLOR}
          >
            Ingress
          </text>
        </g>
        {/* Egress Item */}
        <g transform={`translate(${spacing}, 0)`}>
          {/* Icon centered at (iconSize/2, 0) */}
          {getLegendIcon(iconSize / 2, 0, iconSize, "right")}
          <text
            x={iconSize + textPadding} // Position text after icon + padding
            y={0} // Align text's baseline to icon's center y
            dominantBaseline="middle" // Vertically center text relative to y
            fontSize="12"
            fill={LEGEND_TEXT_COLOR}
          >
            Egress
          </text>
        </g>
      </g>
    );
  }, [layoutPositions.svgHeight]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg
        width="100%"
        height={layoutPositions.svgHeight}
        preserveAspectRatio="xMidYMid meet"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Central Node */}
        {centralNode}

        {/* Destination Nodes and Connections */}
        {routeElements}

        {/* Legend */}
        {legendElement}
      </svg>
    </div>
  );
};

export default NetworkGraphPanel;
