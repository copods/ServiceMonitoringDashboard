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
const DENVER_NODE_RADIUS = 40;
const NODE_RADIUS = 35;
const PROGRESS_RADIUS = 30;

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
    scale: 1,
  });
  const [visibleNodes, setVisibleNodes] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);

  // Store the source location ID to detect changes
  const sourceLocationRef = useRef<string | null>(null);

  // Use useMemo to calculate if the source has changed
  const sourceLocation = useMemo(() => {
    if (!routes || routes.length === 0 || !locations) return null;
    const sourceId = routes[0].sourceId;
    return locations.find((loc) => loc.id === sourceId);
  }, [locations, routes]);

  // Effect for handling animation only when source location changes
  useEffect(() => {
    if (!sourceLocation) return;

    const currentSourceId = sourceLocation.id;

    // Only reset and animate if source location changed or initial load
    if (sourceLocationRef.current !== currentSourceId) {
      // Update the ref to track the current source
      sourceLocationRef.current = currentSourceId;

      // Reset visibility states
      setVisibleNodes(new Set());
      setIsAnimating(true);

      const newVisibleNodes = new Set<string>();

      // Immediately show the central node without animation
      newVisibleNodes.add("central");
      setVisibleNodes(new Set(newVisibleNodes));

      // Animate only the route nodes
      routes.forEach((route, index) => {
        setTimeout(() => {
          newVisibleNodes.add(route.id);
          setVisibleNodes(new Set(newVisibleNodes));
        }, (index + 1) * 150);
      });

      // Reset animation flag after all nodes are shown
      setTimeout(() => {
        setIsAnimating(false);
      }, routes.length * 150);
    }
  }, [sourceLocation, routes]);

  // Effect to measure container dimensions and update positions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth + 100;
        const containerHeight = containerRef.current.clientHeight + 100;

        // Determine if we're in portrait or landscape mode
        const isPortrait = containerHeight > containerWidth;

        // Base dimensions for the graph
        const baseWidth = isPortrait
          ? 900
          : Math.max(containerWidth * 0.9, 1000);
        const routeCount = routes.length || 1;

        // In portrait mode, use full container height
        const baseHeight = isPortrait
          ? 800
          : Math.max(
              containerHeight * 0.9,
              700,
              (routeCount + 1) * MIN_VERTICAL_SPACING + 120
            );

        // Calculate scale based on container size while maintaining aspect ratio
        const widthScale = containerWidth / baseWidth;
        const heightScale = containerHeight / baseHeight;

        // In portrait mode, use height scale to ensure full height usage
        const scale = isPortrait
          ? heightScale // Use height scale in portrait mode
          : Math.min(widthScale, heightScale);

        // Adjust positions based on orientation
        const centralX = isPortrait ? baseWidth * 0.25 : baseWidth * 0.2;
        const progressX = isPortrait ? baseWidth * 0.55 : baseWidth * 0.5;
        const destX = isPortrait ? baseWidth * 0.85 : baseWidth * 0.8;
        const textOffset = baseWidth * 0.04;
        const centralY = baseHeight / 2;

        // Calculate vertical spacing - use more height in portrait mode
        const availableHeight = baseHeight * (isPortrait ? 0.9 : 0.7);
        const minRequiredHeight = (routeCount - 1) * MIN_VERTICAL_SPACING;
        let calculatedPaddingY;

        if (availableHeight >= minRequiredHeight && routeCount > 1) {
          calculatedPaddingY = availableHeight / (routeCount - 1);
        } else {
          calculatedPaddingY = MIN_VERTICAL_SPACING;
        }

        calculatedPaddingY = Math.min(
          Math.max(calculatedPaddingY, MIN_VERTICAL_SPACING),
          isPortrait ? 140 : 110 // Allow more vertical spacing in portrait mode
        );

        setContainerDimensions({
          width: containerWidth,
          height: containerHeight,
        });

        setLayoutPositions({
          centralNodeX: centralX,
          progressX: progressX,
          destNodeX: destX,
          textOffsetX: textOffset,
          svgHeight: baseHeight,
          centralNodeY: centralY,
          paddingY: calculatedPaddingY,
          scale: scale,
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [routes.length]);

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

  console.log(
    "containerDimensions",
    containerDimensions.height,
    containerDimensions.width
  );

  // Memoize the central node with immediate visibility
  const centralNode = useMemo(() => {
    if (!sourceLocation || containerDimensions.width === 0) return null;

    const { centralNodeX, centralNodeY } = layoutPositions;
    const isVisible = true; // Always visible

    return (
      <g
        style={{
          opacity: 1, // Always fully opaque
          transition: "transform 0.3s ease-out",
          transform: "scale(1)", // Always at full scale
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
            opacity: 1, // Always visible
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
            opacity: 1, // Always visible
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
  ]); // Removed visibleNodes dependency

  // --- Updated Legend Memo ---
  const legendElement = useMemo(() => {
    const legendX = 200;
    const legendY = layoutPositions.svgHeight + 20; // Position from bottom
    const iconSize = 24;
    const spacing = 100; // Keep increased spacing between legend items
    const textPadding = 8;

    return (
      <g
        className="legend-group"
        transform={`translate(0, ${-layoutPositions.scale * 50})`}
      >
        {/* Background for legend */}
        <rect
          x={legendX - 10}
          y={legendY - 20}
          width={spacing * 2}
          height={50}
          fill="white"
          rx={4}
          ry={4}
        />

        {/* Ingress Item */}
        <g transform={`translate(${legendX}, ${legendY})`}>
          {getLegendIcon(iconSize / 2, 0, iconSize, "left")}
          <text
            x={iconSize + textPadding}
            y={0}
            dominantBaseline="middle"
            fontSize="14"
            fill={LEGEND_TEXT_COLOR}
            style={{ fontWeight: 500 }}
          >
            Ingress
          </text>
        </g>

        {/* Egress Item */}
        <g transform={`translate(${legendX + spacing}, ${legendY})`}>
          {getLegendIcon(iconSize / 2, 0, iconSize, "right")}
          <text
            x={iconSize + textPadding}
            y={0}
            dominantBaseline="middle"
            fontSize="14"
            fill={LEGEND_TEXT_COLOR}
            style={{ fontWeight: 500 }}
          >
            Egress
          </text>
        </g>
      </g>
    );
  }, [layoutPositions.svgHeight, layoutPositions.scale]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative flex items-center justify-center overflow-hidden"
    >
      <svg
        width={containerDimensions.width}
        height={containerDimensions.height}
        viewBox={`0 0 ${Math.max(1000, containerDimensions.width)} ${
          layoutPositions.svgHeight
        }`}
        preserveAspectRatio={
          containerDimensions.height > containerDimensions.width
            ? "xMidYMid slice"
            : "xMidYMid meet"
        }
        style={{
          fontFamily: "Arial, sans-serif",
          width: "100%",
          height: "100%",
        }}
      >
        <g transform={`scale(${layoutPositions.scale})`}>
          {/* Central Node */}
          {centralNode}

          {/* Destination Nodes and Connections */}
          {routeElements}

          {/* Legend */}
          {legendElement}
        </g>
      </svg>
    </div>
  );
};

export default NetworkGraphPanel;
