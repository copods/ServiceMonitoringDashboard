import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { Service } from "types/service";
import { Domain } from "types/domain";
import { mulberry32, toRoman } from "utils";

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
    if (!svgRef.current || services.length === 0 || domains.length === 0)
      return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    // Adjusted radius calculation to leave more space for icons ON the border
    const iconRadiusSize = 16; // Radius of the icon circle itself
    const radius = Math.min(width, height) / 2 - iconRadiusSize - 10; // Ensure space for icons + padding
    const centerX = width / 2;
    const centerY = height / 2;

    // Create a group for the chart, translated to the center
    const chart = svg
      .append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    // Create pie layout with domain sizes proportional to service counts
    const pie = d3.pie<Domain>().value((d) => d.totalServices).sort(null);

    const pieData = pie(domains);

    // Define arc generator for domain sections
    const arc = d3
      .arc<d3.PieArcDatum<Domain>>()
      .innerRadius(0)
      .outerRadius(radius);

    // Draw domain pie sections
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

    // Draw the main outer circle outline
    chart
      .append("circle")
      .attr("r", radius)
      .attr("fill", "none")
      .attr("stroke", "#444")
      .attr("stroke-width", 1);

    // Inner circles and percentage labels setup
    const innerCircleFactors = [1 / 3, 2 / 3];
    const percentageLabels = ["50%", "25%", "05%"];
    const labelPositions = [0.25, 0.5, 0.8];

    // Draw inner circles
    innerCircleFactors.forEach((factor, i) => {
      chart
        .append("circle")
        .attr("r", radius * factor)
        .attr("fill", "none")
        .attr("stroke", i === 0 ? "#F30030" : "#444")
        .attr("stroke-width", i === 0 ? 1.5 : 1);
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

    // Plot services
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
      const adjustedAngleRange = Math.max(0, adjustedEndAngle - adjustedStartAngle);

      const random = mulberry32(parseInt(service.id, 16) + serviceIndex * 10);

      const importanceFactor = service.importance / 100;
      const baseDistanceFactor = 1 / 3 + ((1 - importanceFactor) * 2) / 3;
      const randomizedDistanceFactor =
        baseDistanceFactor * (0.95 + random() * 0.1);
      const finalDistanceFactor = Math.max(
        1 / 3,
        Math.min(1, randomizedDistanceFactor)
      );
      const distance = radius * finalDistanceFactor;

      const randomAngle = adjustedStartAngle + random() * adjustedAngleRange;
      const cartesianAngle = randomAngle - Math.PI / 2; // Angle correction

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
          setTooltip({ visible: true, x: mouseX, y: mouseY, content: tooltipContent });
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

    // --- Domain Icons ---
    const domainIconPositions: { domain: Domain; x: number; y: number }[] = [];
    pieData.forEach((domainPie, i) => {
      const domain = domains[i];
      const midAngle = (domainPie.startAngle + domainPie.endAngle) / 2;

      const iconPlacementRadius = radius; // Position icons exactly on the border

      const cartesianMidAngle = midAngle - Math.PI / 2; // Angle correction

      const x = iconPlacementRadius * Math.cos(cartesianMidAngle);
      const y = iconPlacementRadius * Math.sin(cartesianMidAngle);

      domainIconPositions.push({ domain, x, y });
    });

    // Icons Layer
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
        .attr("stroke-width", 2);

      // Roman numeral text
      iconGroup
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
          return match ? toRoman(parseInt(match[0], 10)) : "?";
        });
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
    const minReqExample = "100";
    const maxReqExample = "20k+";

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
      .text(`~${minReqExample} reqs`);

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
      .text(`~${maxReqExample} reqs`);

    // --- Percentage Labels ---
    chart
      .append("g")
      .attr("class", "percentage-labels")
      .raise()
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
          .attr("opacity", 0.85);
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "white")
          .attr("font-size", "12px")
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
