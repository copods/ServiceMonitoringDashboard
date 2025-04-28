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
// Base radius for nodes and progress indicators - will be scaled based on container size
const BASE_DENVER_NODE_RADIUS = 40;
const BASE_NODE_RADIUS = 35;
const BASE_PROGRESS_RADIUS = 30;

// Minimum vertical spacing between destination nodes
const MIN_VERTICAL_SPACING = 80;
const MAX_VERTICAL_SPACING = 120;

// Minimum scale factors to ensure readability
const MIN_NODE_SCALE = 0.7;
const MIN_TEXT_SCALE = 0.85;

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
  .innerRadius(BASE_PROGRESS_RADIUS * 0.75)
  .outerRadius(BASE_PROGRESS_RADIUS)
  .startAngle(0);

const backgroundArcGenerator = d3
  .arc()
  .innerRadius(BASE_PROGRESS_RADIUS * 0.75)
  .outerRadius(BASE_PROGRESS_RADIUS)
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

interface LayoutPositions {
  centralNodeX: number;
  centralNodeY: number;
  svgWidth: number;
  svgHeight: number;
  scale: number;
  heightScaleFactor: number;
  progressX: number;
  destNodeX: number;
  textOffsetX: number;
  paddingY: number;
  nodeScale: number;
}

// Add these helper functions before the NetworkGraphPanel component
const getPathLength = (path: string): number => {
  const tempPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  tempPath.setAttribute("d", path);
  return tempPath.getTotalLength();
};

// Add these constants at the top level before the NetworkGraphPanel component
const LINK_TO_IMPACT_DURATION = 500;
const LINK_TO_LEAF_DURATION = 500;

// --- The React Component ---
const NetworkGraphPanel: React.FC<NetworkGraphPanelProps> = ({
  locations,
  routes,
  onRouteSelected,
  selectedRouteId,
  mainDegradationPercentage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [layoutPositions, setLayoutPositions] = useState<LayoutPositions>({
    centralNodeX: 80,
    progressX: 240,
    destNodeX: 400,
    textOffsetX: 18,
    svgHeight: 550,
    centralNodeY: 275,
    paddingY: MIN_VERTICAL_SPACING,
    scale: 1,
    nodeScale: 1,
    svgWidth: 1000,
    heightScaleFactor: 1,
  });
  const [visibleNodes, setVisibleNodes] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const [progressPercentages, setProgressPercentages] = useState<{
    [key: string]: number;
  }>({});

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

      // Reset visibility states and progress
      setVisibleNodes(new Set());
      setIsAnimating(true);
      setProgressPercentages({});

      const newVisibleNodes = new Set<string>();

      // Animation timing constants (in ms)
      const INITIAL_DELAY = 150;
      const LINK_TO_IMPACT_DURATION = 500;
      const IMPACT_CIRCLE_DELAY = 150;
      const LINK_TO_LEAF_DURATION = 500;
      const LEAF_NODE_DELAY = 150;
      const PROGRESS_FILL_DELAY = 500;
      const PROGRESS_FILL_DURATION = 2000;

      // Step 1: Show central node immediately
      newVisibleNodes.add("central");
      setVisibleNodes(new Set(newVisibleNodes));

      // Step 2: Animate links to impact circles
      setTimeout(() => {
        routes.forEach((route) => {
          newVisibleNodes.add(`${route.id}-link-to-impact`);
        });
        setVisibleNodes(new Set(newVisibleNodes));
      }, INITIAL_DELAY);

      // Step 3: Show empty impact circles
      setTimeout(() => {
        routes.forEach((route) => {
          newVisibleNodes.add(`${route.id}-impact`);
        });
        setVisibleNodes(new Set(newVisibleNodes));
      }, INITIAL_DELAY + LINK_TO_IMPACT_DURATION + IMPACT_CIRCLE_DELAY);

      // Step 4: Animate links to leaf nodes
      setTimeout(() => {
        routes.forEach((route) => {
          newVisibleNodes.add(`${route.id}-link-to-leaf`);
        });
        setVisibleNodes(new Set(newVisibleNodes));
      }, INITIAL_DELAY + LINK_TO_IMPACT_DURATION + IMPACT_CIRCLE_DELAY + IMPACT_CIRCLE_DELAY);

      // Step 5: Show leaf nodes
      setTimeout(() => {
        routes.forEach((route) => {
          newVisibleNodes.add(route.id);
        });
        setVisibleNodes(new Set(newVisibleNodes));
      }, INITIAL_DELAY + LINK_TO_IMPACT_DURATION + IMPACT_CIRCLE_DELAY + IMPACT_CIRCLE_DELAY + LINK_TO_LEAF_DURATION + LEAF_NODE_DELAY);

      // Step 6: Start filling progress circles
      setTimeout(() => {
        const newProgressPercentages: { [key: string]: number } = {};
        routes.forEach((route) => {
          newProgressPercentages[route.id] = route.impactPercentage;
        });
        setProgressPercentages(newProgressPercentages);
      }, INITIAL_DELAY + LINK_TO_IMPACT_DURATION + IMPACT_CIRCLE_DELAY + IMPACT_CIRCLE_DELAY + LINK_TO_LEAF_DURATION + LEAF_NODE_DELAY + PROGRESS_FILL_DELAY);

      // Reset animation flag after all animations complete
      setTimeout(() => {
        setIsAnimating(false);
      }, INITIAL_DELAY + LINK_TO_IMPACT_DURATION + IMPACT_CIRCLE_DELAY + IMPACT_CIRCLE_DELAY + LINK_TO_LEAF_DURATION + LEAF_NODE_DELAY + PROGRESS_FILL_DELAY + 2500);
    }
  }, [sourceLocation, routes]);

  // Effect to measure container dimensions and update positions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        // Determine if we're in portrait mode
        const isPortrait = containerHeight > containerWidth;

        // Calculate the minimum required height for the content
        const routeCount = routes.length || 1;
        const minRequiredHeight = (routeCount + 1) * MIN_VERTICAL_SPACING;

        // Calculate dynamic node scaling based on container height
        const heightRatio = Math.max(containerHeight / 800, MIN_NODE_SCALE);
        const nodeScale = isPortrait
          ? Math.min(1.2, heightRatio) // Allow larger scale in portrait mode
          : Math.min(1, heightRatio);

        // Calculate scaled node dimensions
        const scaledDenverRadius = BASE_DENVER_NODE_RADIUS * nodeScale;
        const scaledNodeRadius = BASE_NODE_RADIUS * nodeScale;
        const scaledProgressRadius = BASE_PROGRESS_RADIUS * nodeScale;

        // Base dimensions for the graph
        const baseWidth = isPortrait
          ? Math.max(containerWidth, 700)
          : Math.max(containerWidth, 1000);

        const baseHeight = isPortrait
          ? Math.max(containerHeight, minRequiredHeight, 457)
          : Math.max(containerHeight * 0.9, minRequiredHeight, 477);

        // Calculate scale based on container size while maintaining aspect ratio
        const widthScale = containerWidth / baseWidth;
        const heightScale = containerHeight / baseHeight;

        // In portrait mode, prioritize height scaling
        const scale = isPortrait
          ? Math.min(widthScale, heightScale * 2) // Allow more height scaling
          : Math.min(widthScale, heightScale);

        // Calculate vertical spacing based on available height
        const availableHeight = isPortrait
          ? baseHeight * 0.85 // Use more height in portrait mode
          : baseHeight * 0.7;

        const verticalSpacing = Math.min(
          Math.max(
            availableHeight / (routeCount + 1),
            MIN_VERTICAL_SPACING * nodeScale + 100
          ),
          MAX_VERTICAL_SPACING * nodeScale
        );

        // Calculate horizontal positions with proper spacing
        const horizontalSpace = baseWidth - scaledDenverRadius * 4;
        const centralX = baseWidth * (isPortrait ? 0.1 : 0.2);
        const progressX =
          centralX + horizontalSpace * (isPortrait ? 0.5 : 0.35);
        const destX = centralX + horizontalSpace * (isPortrait ? 0.8 : 0.7);

        // Calculate text offset based on node size
        const textOffset = scaledNodeRadius * 0.5;

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
          centralNodeY: baseHeight / 2,
          paddingY: verticalSpacing,
          scale: scale,
          nodeScale: nodeScale,
          svgWidth: baseWidth,
          heightScaleFactor: heightScale,
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

  // Add a style block for the keyframes animation
  const [animationStyles] = useState(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes fillProgress {
        from {
          stroke-dashoffset: var(--full-dash);
        }
        to {
          stroke-dashoffset: var(--target-dash);
        }
      }
    `;
    document.head.appendChild(styleSheet);
    return styleSheet;
  });

  // Cleanup the style element on unmount
  useEffect(() => {
    return () => {
      if (animationStyles) {
        animationStyles.remove();
      }
    };
  }, [animationStyles]);

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
      nodeScale = 1,
    } = layoutPositions;

    const totalDestinations = routes.length;
    const totalRouteHeight = (totalDestinations - 1) * paddingY;
    const startY = centralNodeY - totalRouteHeight / 2;

    // Scale node dimensions
    const scaledNodeRadius = BASE_NODE_RADIUS * nodeScale;
    const scaledProgressRadius = BASE_PROGRESS_RADIUS * nodeScale;
    const scaledDenverRadius = BASE_DENVER_NODE_RADIUS * nodeScale;

    // Calculate text sizes based on node scale
    const textScale = Math.max(nodeScale, MIN_TEXT_SCALE);
    const baseFontSize = 14;
    const scaledFontSize = Math.round(baseFontSize * textScale);

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
      const nodeStrokeWidth = isSelected ? "2" : "2";
      const currentProgress = progressPercentages[route.id] || 0;
      const radius = BASE_PROGRESS_RADIUS * nodeScale;
      const circumference = 2 * Math.PI * radius;
      const targetOffset =
        circumference - (currentProgress / 100) * circumference;
      const progressColor =
        currentProgress >= 10 ? PROGRESS_HIGH_COLOR : PROGRESS_LOW_COLOR;

      const linePathToProgress = getCurvePath(
        centralNodeX + scaledDenverRadius,
        centralNodeY,
        progressX - scaledProgressRadius,
        progressY
      );
      const linePathToDest = getCurvePath(
        progressX + scaledProgressRadius,
        progressY,
        destNodeX - scaledNodeRadius,
        destY
      );

      const isVisible = visibleNodes.has(route.id);

      return (
        <g
          key={route.id}
          onClick={createRouteClickHandler(route.id)}
          style={{
            cursor: "pointer",
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
              strokeDasharray: `${getPathLength(
                linePathToProgress
              )} ${getPathLength(linePathToProgress)}`,
              strokeDashoffset: visibleNodes.has(`${route.id}-link-to-impact`)
                ? 0
                : getPathLength(linePathToProgress),
              transition: `stroke-dashoffset ${LINK_TO_IMPACT_DURATION}ms ease-in-out, stroke 0.25s ease-out`,
            }}
          />
          <path
            d={linePathToDest}
            stroke={lineColor}
            strokeWidth="1"
            fill="none"
            style={{
              strokeDasharray: `${getPathLength(
                linePathToDest
              )} ${getPathLength(linePathToDest)}`,
              strokeDashoffset: visibleNodes.has(`${route.id}-link-to-leaf`)
                ? 0
                : getPathLength(linePathToDest),
              transition: `stroke-dashoffset ${LINK_TO_LEAF_DURATION}ms ease-in-out, stroke 0.25s ease-out`,
            }}
          />

          {/* Progress Indicator */}
          <g
            transform={`translate(${progressX}, ${progressY}) scale(${nodeScale})`}
            style={{
              opacity: visibleNodes.has(`${route.id}-impact`) ? 1 : 0,
              transition: "opacity 0.5s ease-out",
            }}
          >
            {/* Background circle */}
            <circle
              cx="0"
              cy="0"
              r={radius}
              fill="none"
              stroke={PROGRESS_BG_COLOR}
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="0"
              cy="0"
              r={radius}
              fill="none"
              stroke={progressColor}
              strokeWidth="6"
              strokeLinecap="round"
              transform="rotate(-90)"
              style={
                {
                  strokeDasharray: circumference,
                  strokeDashoffset: circumference,
                  animation: visibleNodes.has(route.id)
                    ? `fillProgress 2s ease-in-out forwards`
                    : "none",
                  "--full-dash": `${circumference}px`,
                  "--target-dash": `${targetOffset}px`,
                } as any
              }
            />
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={14 * nodeScale}
              fontWeight="600"
              fill={TEXT_COLOR}
            >
              {Math.round(currentProgress)}%
            </text>
          </g>

          {/* Streams text */}
          <text
            x={progressX + scaledProgressRadius + textOffsetX / 2}
            y={progressY - 18}
            dominantBaseline="middle"
            fontSize={scaledFontSize}
            fill={TEXT_COLOR}
            style={{
              transition: "opacity 0.5s ease-out",
              opacity: visibleNodes.has(`${route.id}-impact`) ? 1 : 0,
            }}
          >
            {Math.round(route.streamCount / 1000)}k streams
          </text>

          {/* Destination Node */}
          <g
            style={{
              transition: "all 0.5s ease-out",
              opacity: visibleNodes.has(route.id) ? 1 : 0,
              transform: visibleNodes.has(route.id) ? "scale(1)" : "scale(0)",
              transformOrigin: `${destNodeX}px ${destY}px`,
            }}
          >
            <circle
              cx={destNodeX}
              cy={destY}
              r={scaledNodeRadius}
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
              scaledNodeRadius * 0.9,
              false,
              isSelected
            )}
            <text
              x={destNodeX + scaledNodeRadius + textOffsetX}
              y={destY - 6}
              dominantBaseline="middle"
              fontWeight="600"
              fontSize={scaledFontSize}
              fill={TEXT_COLOR}
            >
              {destinationLocation.name}
            </text>
            <text
              x={destNodeX + scaledNodeRadius + textOffsetX}
              y={destY + 12}
              dominantBaseline="middle"
              fontSize={scaledFontSize}
              fill={TEXT_COLOR}
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
    progressPercentages,
  ]);

  console.log(
    "containerDimensions",
    containerDimensions.height,
    containerDimensions.width
  );

  // Memoize the central node
  const centralNode = useMemo(() => {
    if (!sourceLocation || containerDimensions.width === 0) return null;

    const { centralNodeX, centralNodeY, nodeScale = 1 } = layoutPositions;

    const scaledDenverRadius = BASE_DENVER_NODE_RADIUS * nodeScale;
    const textScale = Math.max(nodeScale, MIN_TEXT_SCALE);
    const scaledFontSize = Math.round(14 * textScale);
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
          r={scaledDenverRadius}
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
          scaledDenverRadius * 0.9,
          true,
          true
        )}
        <text
          x={centralNodeX}
          y={centralNodeY + scaledDenverRadius + 16}
          textAnchor="middle"
          fontWeight="600"
          fontSize={scaledFontSize}
          fill={TEXT_COLOR}
          style={{
            opacity: 1, // Always visible
          }}
        >
          {sourceLocation.name}
        </text>
        <text
          x={centralNodeX}
          y={centralNodeY + scaledDenverRadius + 32}
          textAnchor="middle"
          fontSize={scaledFontSize}
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
  ]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-auto bg-[#ffffff]"
      style={{ minHeight: "400px" }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${containerDimensions.width} ${containerDimensions.height}`}
        preserveAspectRatio="none"
      >
        <g transform={`scale(${layoutPositions.scale})`}>
          {/* Central Node */}
          {centralNode}

          {/* Destination Nodes and Connections */}
          {routeElements}
        </g>
        {/* Always visible legend at bottom left */}
        <g
          className="legend-group"
          transform={`translate(24, ${containerDimensions.height - 64})`}
        >
          {/* Background for legend */}
          <rect
            x={-10}
            y={-20}
            width={200}
            height={50}
            fill="white"
            rx={4}
            ry={4}
          />
          {/* Ingress Item */}
          <g>
            {getLegendIcon(12, 0, 24, "left")}
            <text
              x={32}
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
          <g transform="translate(100, 0)">
            {getLegendIcon(12, 0, 24, "right")}
            <text
              x={32}
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
      </svg>
    </div>
  );
};

export default NetworkGraphPanel;
