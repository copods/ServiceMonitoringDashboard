import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Service } from 'types/service';
import { Domain } from 'types/domain';
import { toRoman } from 'utils';

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
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });

  useEffect(() => {
    if (!svgRef.current || services.length === 0 || domains.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const radius = Math.min(width, height) / 2 - 40;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create a group for the chart
    const chart = svg
      .append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    // Create pie layout with domain sizes proportional to service counts
    const pie = d3.pie<Domain>().value((d) => d.totalServices).sort(null); // Don't sort to maintain domain order

    const pieData = pie(domains);

    // Define arc generator
    const arc = d3
      .arc<d3.PieArcDatum<Domain>>()
      .innerRadius(0)
      .outerRadius(radius);

    // Draw domain pie sections with alternating colors - thicker stroke
    chart
      .selectAll(".domain-section")
      .data(pieData)
      .enter()
      .append("path")
      .attr("class", "domain-section")
      .attr("d", arc)
      .attr("fill", (d, i) => (i % 2 === 0 ? "#23232B" : "#2E2F34"))
      .attr("stroke", "#333")
      .attr("stroke-width", 1.5);

    // Draw circular sections (main circle outline)
    chart
      .append("circle")
      .attr("r", radius)
      .attr("fill", "none")
      .attr("stroke", "#444")
      .attr("stroke-width", 1);

    // Define variables for drawing percentage labels later (at the end of chart drawing)
    const innerCircleFactors = [1 / 3, 2 / 3]; // Two equally dividing factors
    const percentageLabels = ["50%", "25%", "05%"]; // Labels to display
    const labelPositions = [0.25, 0.5, 0.8]; // Positions for the labels - repositioned as per requirements

    // Draw the two inner circles
    innerCircleFactors.forEach((factor, i) => {
      chart
        .append("circle")
        .attr("r", radius * factor)
        .attr("fill", "none")
        .attr("stroke", i === 0 ? "#F30030" : "#444") // Make innermost circle red
        .attr("stroke-width", i === 0 ? 1.5 : 1);
    });

    // Create a better random number generator with a seed
    const mulberry32 = (seed: number) => {
      return () => {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    };

    // Group services by domain for better distribution
    const servicesByDomain = domains.map((domain) => {
      return services.filter((service) => service.domainId === domain.id);
    });

    // Plot services within their respective domain sections
    servicesByDomain.forEach((domainServices, domainIndex) => {
      const domainPie = pieData[domainIndex];
      if (!domainPie) return;

      // Calculate angles for this domain
      const domainStartAngle = domainPie.startAngle;
      const domainEndAngle = domainPie.endAngle;
      const domainAngleRange = domainEndAngle - domainStartAngle;

      // Add padding to avoid services too close to domain boundaries
      const paddingAngle = domainAngleRange * 0.1; // 10% padding
      const adjustedStartAngle = domainStartAngle + paddingAngle;
      const adjustedEndAngle = domainEndAngle - paddingAngle;
      const adjustedAngleRange = adjustedEndAngle - adjustedStartAngle;

      // Plot services in this domain
      domainServices.forEach((service, i) => {
        // Create a deterministic but well-distributed random generator for this service
        const random = mulberry32(parseInt(service.id) * 1000 + i * 10);

        // Direct mapping from importance to distance (higher importance = closer to center)
        const importanceFactor = service.importance / 100; // 0 to 1
        // Map importance directly to a position between inner circle (1/3) and outer edge
        // Higher importance (closer to 1) = closer to center
        const distanceFactor = (1 / 3) + ((1 - importanceFactor) * 2 / 3);
        // Add slight random variation (±10%) to prevent overlap
        const adjustedDistanceFactor = distanceFactor * (0.95 + random() * 0.1);
        // Random angle within domain section
        const randomAngle = adjustedStartAngle + random() * adjustedAngleRange;
        // Calculate final position
        const distance = radius * adjustedDistanceFactor;
        const x = distance * Math.cos(randomAngle);
        const y = distance * Math.sin(randomAngle);

        // Bubble size based on total requests
        const size = Math.max(
          3,
          Math.min(20, Math.sqrt(service.totalRequests) / 12)
        );

        // Bubble color based on status
        const color =
          service.status === "critical"
            ? "#F30030" // Red for critical
            : service.status === "warning"
              ? "#FFCC00" // Yellow for warning
              : "#4A4A52"; // Gray for normal

        // Create service bubble
        const bubble = chart
          .append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", size)
          .attr("fill", color)
          .attr("opacity", 0.9)
          .attr("stroke", "#333")
          .attr("stroke-width", 1)
          .style("cursor", "pointer");

        // Custom tooltip handling
        bubble
          .on("mouseover", (event) => {
            const tooltipContent = `${service.name}\nRequests: ${service.totalRequests.toLocaleString()}\nCriticality: ${service.criticalityPercentage}%`;

            // Calculate position relative to SVG
            const svgRect = svgRef.current?.getBoundingClientRect();
            if (!svgRect) return;

            // Get mouse position
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
            // Update tooltip position on mouse move
            const svgRect = svgRef.current?.getBoundingClientRect();
            if (!svgRect) return;

            const mouseX = event.clientX - svgRect.left;
            const mouseY = event.clientY - svgRect.top;

            setTooltip((prev) => ({
              ...prev,
              x: mouseX,
              y: mouseY,
            }));
          })
          .on("mouseout", () => {
            setTooltip((prev) => ({
              ...prev,
              visible: false,
            }));
          });

        // Add click event
        if (onServiceSelect) {
          bubble.on("click", () => {
            onServiceSelect(service.id);
          });
        }
      });
    });

    // Calculate domain icon positions to render them at the chart border
    const domainIconPositions: { domain: Domain; x: number; y: number }[] = [];

    domains.forEach((domain, i) => {
      const domainPie = pieData[i];
      const midAngle = (domainPie.startAngle + domainPie.endAngle) / 2;

      // Position exactly on chart border
      const labelRadius = radius;
      const x = labelRadius * Math.cos(midAngle);
      const y = labelRadius * Math.sin(midAngle);

      // Store position for domain icon
      domainIconPositions.push({ domain, x, y });
    });

    // Create a group for domain icons that will be on top of everything else
    const iconsLayer = chart
      .append("g")
      .attr("class", "domain-icons-layer")
      .raise(); // Raise to ensure icons are on top

    // Add domain icons at the calculated positions
    domainIconPositions.forEach(({ domain, x, y }) => {
      // Create a circle with border for the domain icon
      iconsLayer
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 16)
        .attr("fill", "transparent")
        .attr("stroke", domain.colorCode)
        .attr("stroke-width", 2);

      // Add the domain ID as Roman numeral
      iconsLayer
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", domain.colorCode)
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text(() => {
          const match = domain.id.match(/\d+$/);
          return match ? toRoman(parseInt(match[0], 10)) : "";
        });
    });

    // Add legend for service status
    const legend = svg.append("g").attr("transform", `translate(20, 20)`);

    const statuses = [
      { label: "Normal", color: "#4A4A52" },
      { label: "Warning", color: "#FFCC00" },
      { label: "Critical", color: "#F30030" },
    ];

    statuses.forEach((status, i) => {
      // Create legend with colored dots
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

    // Add bubble size legend at the bottom
    const sizeLegend = svg
      .append("g")
      .attr("transform", `translate(20, ${height - 50})`);

    sizeLegend
      .append("circle")
      .attr("cx", 8)
      .attr("cy", 8)
      .attr("r", 4)
      .attr("fill", "#808080");

    sizeLegend
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text("Min - 1K");

    sizeLegend
      .append("circle")
      .attr("cx", 100)
      .attr("cy", 8)
      .attr("r", 10)
      .attr("fill", "#808080");

    sizeLegend
      .append("text")
      .attr("x", 120)
      .attr("y", 12)
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text("Max - 10K");

    // Add the percentage labels at the very end to ensure they appear on top
    chart
      .append("g")
      .attr("class", "percentage-labels")
      .raise() // Raise to the top of the display order
      .selectAll(".percentage-label")
      .data(labelPositions)
      .enter()
      .append("g")
      .attr("class", "percentage-label")
      .attr("transform", (d) => `translate(0, ${-radius * d})`)
      .each(function (d, i) {
        const g = d3.select(this);

        // Background for label
        g.append("rect")
          .attr("x", -20)
          .attr("y", -12)
          .attr("width", 40)
          .attr("height", 24)
          .attr("fill", "#1A1B20")
          .attr("rx", 4)
          .attr("opacity", 0.9); // Increased opacity for better visibility

        // Text for label
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "white")
          .attr("font-size", "14px")
          .text(percentageLabels[i]);
      });
  }, [services, domains, width, height, onServiceSelect]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-[#232429]"
      />

      {/* Custom tooltip */}
      {tooltip.visible && (
        <div
          className="absolute bg-gray-900 text-white p-2 rounded shadow-lg z-10 pointer-events-none"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 10}px`,
            maxWidth: "200px",
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
