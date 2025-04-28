import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { Service } from "types/service";
import { Domain } from "types/domain";
import { mulberry32, toRoman } from "utils";
import { useDispatch } from "react-redux";
import { completeServiceAnimation } from "store/slices/servicesSlice";

interface PolarChartProps {
  services: Service[];
  domains: Domain[];
  width: number;
  height: number;
  onServiceSelect?: (serviceId: string) => void;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: string;
}

const PolarChart: React.FC<PolarChartProps> = ({
  services,
  domains,
  width,
  height,
  onServiceSelect,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const dispatch = useDispatch();
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });
  const hasAnimatedRef = useRef(false);

  // Use refs to store previous positions for animations
  const servicePositionsRef = useRef<
    Map<
      string,
      {
        x: number;
        y: number;
        importance: number;
        angle: number;
      }
    >
  >(new Map());
  const animatingServicesRef = useRef<Set<string>>(new Set());
  const animationRequestRef = useRef<number | null>(null);

  // Function references to avoid circular dependencies
  const updateSparkTrailRef = useRef<any>(null);
  const updateAnimatingServicesRef = useRef<any>(null);

  // Function to create or update spark trail effect
  const updateSparkTrail = useCallback(
    (
      svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
      serviceId: string,
      currentPos: { x: number; y: number },
      startPos: { x: number; y: number },
      progress: number,
      isMovingToCenter: boolean
    ) => {
      // Calculate direction vector (from start to current)
      const directionX = currentPos.x - startPos.x;
      const directionY = currentPos.y - startPos.y;
      const distance = Math.sqrt(
        directionX * directionX + directionY * directionY
      );

      // Skip if movement is too small
      if (distance < 0.5) return;

      // Get the main chart group (first g element)
      const chart = svg.select("g") as any;

      // Calculate normalized direction vector
      const dirX = directionX / distance;
      const dirY = directionY / distance;

      // Calculate trail length based on distance and animation progress
      const maxTrailLength = Math.min(45, distance * 0.95); // Increased from 35 to 45
      const trailLength = maxTrailLength * (1 - progress * 0.6); // Reduced from 0.7 to 0.6 for longer trails

      // Calculate trail start position (opposite to movement direction)
      const trailStartX = currentPos.x - dirX * trailLength;
      const trailStartY = currentPos.y - dirY * trailLength;

      // Select or create trail element
      let trail = svg.select(`.spark-trail-${serviceId}`);

      if (trail.empty()) {
        // Create trail group in main chart
        trail = chart.append("g").attr("class", `spark-trail-${serviceId}`);

        // Create trail line with denser dash pattern
        trail
          .append("line")
          .attr("stroke", isMovingToCenter ? "#ffcc00" : "#3498db")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "1,1"); // Changed from "2,2" to "1,1"

        // Create more trail particles (increased from 6 to 12)
        for (let i = 0; i < 12; i++) {
          trail
            .append("circle")
            .attr("class", `spark-particle-${i}`)
            .attr("r", 1 + i * 0.2) // Reduced from 0.3 to 0.2 for more uniform sizes
            .attr("fill", isMovingToCenter ? "#ffcc00" : "#3498db")
            .attr("opacity", 0.95 - i * 0.05); // Increased base opacity and reduced decay
        }
      }

      // Update trail line with higher opacity
      trail
        .select("line")
        .attr("x1", currentPos.x)
        .attr("y1", currentPos.y)
        .attr("x2", trailStartX)
        .attr("y2", trailStartY)
        .attr("opacity", 0.8 - progress * 0.6); // Increased from 0.7 to 0.8

      // Update trail particles with more frequent spacing
      for (let i = 0; i < 12; i++) {
        const particleProgress = Math.min(1, progress + i * 0.0005); // Reduced from 0.001 to 0.0005
        const particleX =
          currentPos.x + (trailStartX - currentPos.x) * (i * 0.08); // Reduced from 0.15 to 0.08
        const particleY =
          currentPos.y + (trailStartY - currentPos.y) * (i * 0.08);

        trail
          .select(`.spark-particle-${i}`)
          .attr("cx", particleX)
          .attr("cy", particleY)
          .attr("opacity", Math.max(0, 0.9 - particleProgress * 0.5)); // Increased opacity
      }

      // Remove trail when animation completes
      if (progress >= 0.98) {
        // Changed from 0.95 to 0.98 to keep trail visible longer
        setTimeout(() => {
          trail.remove();
        }, 30); // Reduced from 50ms to 30ms
      }
    },
    []
  );

  // Store the function in ref to avoid circular dependencies
  updateSparkTrailRef.current = updateSparkTrail;

  // Function to update animating services
  const updateAnimatingServices = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const radius = Math.min(width, height) / 2 - 16 - 10; // Same radius calculation as in chart

    // For each animating service, update its position
    animatingServicesRef.current.forEach((serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      if (!service || !service.animatingImportance) {
        animatingServicesRef.current.delete(serviceId);
        return;
      }

      // Get current time for animation progress calculation
      const now = Date.now();
      const animationStartTime = service.animationStartTime || now;
      const animationDuration = 2000; // Reduced from 2500 to 2000ms for snappier animations
      const elapsed = now - animationStartTime;
      const progress = Math.min(1, elapsed / animationDuration);

      // Get previous position data
      const prevPosition = servicePositionsRef.current.get(serviceId);
      if (!prevPosition) return;

      // If animation is complete
      if (progress >= 1) {
        animatingServicesRef.current.delete(serviceId);
        dispatch(completeServiceAnimation(serviceId));

        // Remove any spark trails
        svg.select(`.spark-trail-${serviceId}`).remove();
        return;
      }

      // Calculate new position based on importance
      const { angle } = prevPosition;
      const prevImportance =
        service.previousImportance !== undefined
          ? service.previousImportance
          : prevPosition.importance;
      const newImportance = service.importance;

      // Calculate distances using the same formula as the updated positioning logic
      const prevDistanceFactor = Math.max(
        0.1,
        1 - (prevImportance / 100) * 0.9
      );
      const newDistanceFactor = Math.max(0.1, 1 - (newImportance / 100) * 0.9);

      const prevDistance = radius * prevDistanceFactor;
      const newDistance = radius * newDistanceFactor;
      const currentDistance =
        prevDistance + (newDistance - prevDistance) * progress;

      // Calculate new coordinates
      const currentX = currentDistance * Math.cos(angle);
      const currentY = currentDistance * Math.sin(angle);

      // Update the service circle position
      const serviceNode = svg.select(`.service-${serviceId}`);
      if (!serviceNode.empty()) {
        serviceNode.attr("cx", currentX).attr("cy", currentY);

        // Update stored position for future animations
        if (progress >= 1) {
          servicePositionsRef.current.set(serviceId, {
            x: currentX,
            y: currentY,
            importance: newImportance,
            angle,
          });
        }

        // Create or update spark trail effect using the ref
        if (updateSparkTrailRef.current) {
          updateSparkTrailRef.current(
            svg,
            serviceId,
            { x: currentX, y: currentY },
            { x: prevPosition.x, y: prevPosition.y },
            progress,
            newImportance > prevImportance
          );
        }
      }
    });
  }, [width, height, services, dispatch]);

  // Store the function in ref to avoid circular dependencies
  updateAnimatingServicesRef.current = updateAnimatingServices;

  // Animation loop for service importance changes
  useEffect(() => {
    const animatingServices = services.filter((s) => s.animatingImportance);

    if (animatingServices.length > 0) {
      // Store IDs of animating services
      animatingServicesRef.current = new Set(
        animatingServices.map((service) => service.id)
      );

      // Set up animation frame loop
      const animate = () => {
        // Continue animation if there are still animating services
        if (animatingServicesRef.current.size > 0) {
          // Use the ref function to avoid dependency issues
          if (updateAnimatingServicesRef.current) {
            updateAnimatingServicesRef.current();
          }
          animationRequestRef.current = requestAnimationFrame(animate);
        }
      };

      // Start animation loop
      animationRequestRef.current = requestAnimationFrame(animate);

      return () => {
        // Clean up animation frame on unmount or when dependencies change
        if (animationRequestRef.current) {
          cancelAnimationFrame(animationRequestRef.current);
          animationRequestRef.current = null;
        }
      };
    }
  }, [services, dispatch, updateAnimatingServices]);

  // Main chart rendering
  useEffect(() => {
    if (
      !svgRef.current ||
      services.length === 0 ||
      domains.length === 0 ||
      hasAnimatedRef.current
    )
      return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const iconRadiusSize = 16;
    const radius = Math.min(width, height) / 2 - iconRadiusSize - 10;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create a group for the chart, translated to the center
    const chart = svg
      .append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    // Create pie layout with domain sizes proportional to service counts
    const pie = d3
      .pie<Domain>()
      .value((d) => d.totalServices)
      .sort(null);

    const pieData = pie(domains);

    // Define arc generator for domain sections
    const arc = d3
      .arc<d3.PieArcDatum<Domain>>()
      .innerRadius(0)
      .outerRadius(radius);

    // Draw domain pie sections with animation
    const domainSections = chart
      .selectAll(".domain-section")
      .data(pieData)
      .enter()
      .append("path")
      .attr("class", "domain-section")
      .attr("fill", (d, i) => (i % 2 === 0 ? "#23232B" : "#2E2F34"))
      .attr("stroke", "#333")
      .attr("stroke-width", 1.5)
      .attr("d", (d) => {
        const arcGenerator = d3
          .arc<d3.PieArcDatum<Domain>>()
          .innerRadius(0)
          .outerRadius(0)
          .startAngle(d.startAngle)
          .endAngle(d.endAngle);
        return arcGenerator(d) || "";
      });

    // Animate domain sections
    domainSections
      .transition()
      .duration(1000)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate(0, radius);
        return function (t) {
          const arcGenerator = d3
            .arc<d3.PieArcDatum<Domain>>()
            .innerRadius(0)
            .outerRadius(interpolate(t))
            .startAngle(d.startAngle)
            .endAngle(d.endAngle);
          return arcGenerator(d) || "";
        };
      });

    // Draw the main outer circle outline with animation
    const outerCircle = chart
      .append("circle")
      .attr("r", 0)
      .attr("fill", "none")
      .attr("stroke", "#444")
      .attr("stroke-width", 1);

    outerCircle.transition().duration(1000).attr("r", radius);

    // Draw inner circles with animation
    const innerCircleFactors = [1 / 3, 2 / 3];
    const percentageLabels = ["50%", "25%", "05%"];
    const labelPositions = [0.25, 0.5, 0.8];

    const innerCircles = chart
      .selectAll(".inner-circle")
      .data(innerCircleFactors)
      .enter()
      .append("circle")
      .attr("r", 0)
      .attr("fill", "none")
      .attr("stroke", (d, i) => (i === 0 ? "#F30030" : "#444"))
      .attr("stroke-width", (d, i) => (i === 0 ? 1.5 : 1));

    innerCircles
      .transition()
      .duration(1000)
      .delay(1000)
      .attr("r", (d) => radius * d);

    // Add percentage labels with animation
    const percentageLabelGroup = chart
      .append("g")
      .attr("class", "percentage-labels")
      .raise();

    percentageLabelGroup
      .selectAll(".percentage-label")
      .data(labelPositions)
      .enter()
      .append("g")
      .attr("class", "percentage-label")
      .attr("transform", (d) => `translate(0, ${-radius * d})`)
      .each(function (d, i) {
        const g = d3.select(this);
        g.append("rect")
          .attr("x", -20)
          .attr("y", -12)
          .attr("width", 40)
          .attr("height", 24)
          .attr("fill", "#1A1B20")
          .attr("rx", 4)
          .attr("opacity", 0)
          .transition()
          .duration(1000)
          .delay(2000)
          .attr("opacity", 0.85);

        g.append("text")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "white")
          .attr("font-size", "12px")
          .attr("opacity", 0)
          .text(percentageLabels[i])
          .transition()
          .duration(1000)
          .delay(2000)
          .attr("opacity", 1);
      });

    // Domain lookup map
    const domainMap = new Map<
      string,
      { domain: Domain; index: number; pieData: d3.PieArcDatum<Domain> }
    >();
    domains.forEach((domain, index) => {
      const domainPieData = pieData[index];
      if (domainPieData) {
        domainMap.set(domain.id, {
          domain,
          index,
          pieData: domainPieData,
        });
      }
    });

    // Plot services with animation
    const totalDelay = 3000; // Longer initial delay
    const staggerDelay = 5; // Very short delay between points

    services.forEach((service, serviceIndex) => {
      const domainInfo = domainMap.get(service.domainId);
      if (!domainInfo) {
        console.warn(`Domain info not found for service: ${service.id}`);
        return;
      }
      const { pieData: domainPie } = domainInfo;

      const domainStartAngle = domainPie.startAngle;
      const domainEndAngle = domainPie.endAngle;
      const domainAngleRange = domainEndAngle - domainStartAngle;

      const paddingAngle = domainAngleRange * 0.05;
      const adjustedStartAngle = domainStartAngle + paddingAngle;
      const adjustedEndAngle = domainEndAngle - paddingAngle;
      const adjustedAngleRange = Math.max(
        0,
        adjustedEndAngle - adjustedStartAngle
      );

      const random = mulberry32(parseInt(service.id, 16) + serviceIndex * 10);

      const importanceFactor = service.importance / 100;
      const baseDistanceFactor = Math.max(0.1, 1 - importanceFactor * 0.9);
      const randomizedDistanceFactor =
        baseDistanceFactor * (0.95 + random() * 0.1);
      const finalDistanceFactor = Math.max(
        0.1,
        Math.min(1, randomizedDistanceFactor)
      );
      const distance = radius * finalDistanceFactor;

      const randomAngle = adjustedStartAngle + random() * adjustedAngleRange;
      const cartesianAngle = randomAngle - Math.PI / 2;

      const x = distance * Math.cos(cartesianAngle);
      const y = distance * Math.sin(cartesianAngle);

      const size = Math.max(
        3,
        Math.min(15, Math.sqrt(service.totalRequests) / 10)
      );
      const color =
        service.status === "critical"
          ? "#F30030"
          : service.status === "warning"
          ? "#FFCC00"
          : "#4A4A52";

      // Create service circle with initial size 0
      const bubble = chart
        .append("circle")
        .attr("class", `service-${service.id}`)
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 0)
        .attr("fill", color)
        .attr("opacity", 0.9)
        .attr("stroke", "#333")
        .attr("stroke-width", 1)
        .style("cursor", "pointer");

      // Animate service circle with staggered timing
      bubble
        .transition()
        .duration(200) // Very short duration
        .delay(totalDelay + serviceIndex * staggerDelay) // Staggered delay
        .attr("r", size);

      // Store initial position data for animations
      servicePositionsRef.current.set(service.id, {
        x,
        y,
        importance: service.importance,
        angle: cartesianAngle, // Store angle for animation calculations
      });

      // Add glow effect for animating services
      if (service.animatingImportance) {
        bubble.attr("filter", "url(#glow)");
      }

      // Tooltip Handling
      bubble
        .on("mouseover", (event) => {
          const tooltipContent = `${
            service.name
          }\nRequests: ${service.totalRequests.toLocaleString()}\nCriticality: ${
            service.criticalityPercentage
          }%`;
          const svgRect = svgRef.current?.getBoundingClientRect();
          if (!svgRect) return;
          const mouseX = event.clientX - svgRect.left;
          const mouseY = event.clientY - svgRect.top;
          setTooltip({
            visible: true,
            x: mouseX,
            y: mouseY,
            content: tooltipContent,
          });
        })
        .on("mousemove", (event) => {
          const svgRect = svgRef.current?.getBoundingClientRect();
          if (!svgRect) return;
          const mouseX = event.clientX - svgRect.left;
          const mouseY = event.clientY - svgRect.top;
          setTooltip((prev) => ({ ...prev, x: mouseX, y: mouseY }));
        })
        .on("mouseout", () => {
          setTooltip((prev) => ({ ...prev, visible: false }));
        });

      // Click Handling
      if (onServiceSelect) {
        bubble.on("click", () => {
          onServiceSelect(service.id);
        });
      }
    });

    // Add Roman numeral labels after circles are drawn
    const domainIconPositions: { domain: Domain; x: number; y: number }[] = [];
    pieData.forEach((domainPie, i) => {
      const domain = domains[i];
      const midAngle = (domainPie.startAngle + domainPie.endAngle) / 2;
      const iconPlacementRadius = radius;
      const cartesianMidAngle = midAngle - Math.PI / 2;
      const x = iconPlacementRadius * Math.cos(cartesianMidAngle);
      const y = iconPlacementRadius * Math.sin(cartesianMidAngle);
      domainIconPositions.push({ domain, x, y });
    });

    // Icons Layer with animation
    const iconsLayer = chart
      .append("g")
      .attr("class", "domain-icons-layer")
      .raise();

    domainIconPositions.forEach(({ domain, x, y }) => {
      const iconGroup = iconsLayer.append("g");

      iconGroup
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", iconRadiusSize)
        .attr("fill", "#232429")
        .attr("stroke", domain.colorCode)
        .attr("stroke-width", 2)
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .delay(2000)
        .attr("opacity", 1);

      // Roman numeral text with animation
      iconGroup
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", domain.colorCode)
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("opacity", 0)
        .text(() => {
          const match = domain.id.match(/\d+$/);
          return match ? toRoman(parseInt(match[0], 10)) : "?";
        })
        .transition()
        .duration(1000)
        .delay(2000)
        .attr("opacity", 1);
    });

    // --- Legends ---
    // Status Legend
    const legend = svg.append("g").attr("transform", `translate(20, 20)`);
    const statuses = [
      { label: "Normal", color: "#4A4A52" },
      { label: "Warning", color: "#FFCC00" },
      { label: "Critical", color: "#F30030" },
    ];
    statuses.forEach((status, i) => {
      legend
        .append("circle")
        .attr("cx", 8)
        .attr("cy", i * 22 + 8)
        .attr("r", 4)
        .attr("fill", status.color);
      legend
        .append("text")
        .attr("x", 20)
        .attr("y", i * 22 + 12)
        .attr("fill", "white")
        .attr("font-size", "12px")
        .text(status.label);
    });

    // Size Legend
    const sizeLegend = svg
      .append("g")
      .attr("transform", `translate(20, ${height - 60})`);
    const minSizeExample = 3;
    const maxSizeExample = 15;

    sizeLegend
      .append("circle")
      .attr("cx", maxSizeExample + 5)
      .attr("cy", maxSizeExample + 5)
      .attr("r", minSizeExample)
      .attr("fill", "#808080")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.5);
    sizeLegend
      .append("text")
      .attr("x", maxSizeExample * 2 + 15)
      .attr("y", maxSizeExample + 10)
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("dominant-baseline", "middle")
      .text("~100 reqs");

    sizeLegend
      .append("circle")
      .attr("cx", maxSizeExample + 5)
      .attr("cy", maxSizeExample * 2 + 15)
      .attr("r", maxSizeExample)
      .attr("fill", "#808080")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.5);
    sizeLegend
      .append("text")
      .attr("x", maxSizeExample * 2 + 15)
      .attr("y", maxSizeExample * 2 + 20)
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("dominant-baseline", "middle")
      .text("~10k reqs");

    hasAnimatedRef.current = true;
  }, [services, domains, width, height, onServiceSelect]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-[#232429]"
      />
      {tooltip.visible && (
        <div
          className="absolute bg-gray-900 text-white p-2 rounded shadow-lg z-10 pointer-events-none text-xs"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 10}px`,
            maxWidth: "180px",
            whiteSpace: "pre-line",
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};
export default PolarChart;
