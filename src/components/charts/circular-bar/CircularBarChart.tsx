import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { HourlyData } from "types/service";

interface CircularBarChartProps {
  hourlyData: HourlyData[];
  width: number;
  height: number;
}

const CircularBarChart: React.FC<CircularBarChartProps> = ({
  hourlyData,
  width,
  height,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!svgRef.current || hourlyData.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const radius = Math.min(width, height) / 2 - 30;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create a group for the chart
    const chart = svg
      .append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    // Calculate the angle for each hour (24 hours)
    const angleStep = (2 * Math.PI) / 24;
    const startAngle = Math.PI;

    // Create scales for bar height
    const maxRequests = d3.max(hourlyData, (d) => d.totalRequests) || 0;
    const radiusScale = d3
      .scaleLinear()
      .domain([0, maxRequests])
      .range([radius * 0.35, radius * 0.8]);

    const mainHours = [0, 6, 12, 18];

    // Draw outer circle with animation
    const outerCircle = chart
      .append("circle")
      .attr("r", 0)
      .attr("fill", "none")
      .attr("stroke", "#4A4A54")
      .attr("stroke-width", 1);

    outerCircle
      .transition()
      .duration(1000)
      .attr("r", radius)
      .on("end", () => {
        // Draw center circle with animation
        const centerCircle = chart
          .append("circle")
          .attr("r", 0)
          .attr("fill", "#1D1E24")
          .attr("stroke", "#333")
          .attr("stroke-width", 1);

        centerCircle
          .transition()
          .duration(1000)
          .attr("r", radius * 0.35)
          .on("end", () => {
            // Draw AM/PM divider with animation
            const divider = chart
              .append("line")
              .attr("x1", 0)
              .attr("y1", 0)
              .attr("x2", 0)
              .attr("y2", 0)
              .attr("stroke", "#9c9c9c")
              .attr("stroke-width", 1.2);

            divider
              .transition()
              .duration(1000)
              .attr("x1", -radius * 0.35)
              .attr("x2", radius * 0.35)
              .on("end", () => {
                // Draw hour markers and labels
                for (let i = 0; i < 24; i++) {
                  const angle = i * angleStep + startAngle;
                  const isMainHour = mainHours.includes(i);

                  // Draw tick mark
                  const outerX = radius * Math.cos(angle);
                  const outerY = radius * Math.sin(angle);
                  const innerX = (radius + 5) * Math.cos(angle);
                  const innerY = (radius + 5) * Math.sin(angle);

                  const tick = chart
                    .append("line")
                    .attr("x1", innerX)
                    .attr("y1", innerY)
                    .attr("x2", outerX)
                    .attr("y2", outerY)
                    .attr("stroke", "#4A4A54")
                    .attr("stroke-width", 1)
                    .attr("opacity", 0);

                  tick
                    .transition()
                    .duration(500)
                    .delay(i * 50)
                    .attr("opacity", 1);

                  if (isMainHour) {
                    const labelDistance = radius + 20;
                    const labelX = labelDistance * Math.cos(angle);
                    const labelY = labelDistance * Math.sin(angle);
                    const hourText =
                      i === 0 ? "24" : i.toString().padStart(2, "0");

                    const label = chart
                      .append("text")
                      .attr("x", labelX)
                      .attr("y", labelY)
                      .attr("text-anchor", "middle")
                      .attr("dominant-baseline", "middle")
                      .attr("fill", "#C0C0C0")
                      .attr("font-size", "14px")
                      .attr("opacity", 0)
                      .text(hourText);

                    label
                      .transition()
                      .duration(500)
                      .delay(i * 50)
                      .attr("opacity", 1);
                  }
                }

                // Draw AM/PM text with animation
                const amText = chart
                  .append("text")
                  .attr("x", 0)
                  .attr("y", -10)
                  .attr("text-anchor", "middle")
                  .attr("fill", "#C0C0C0")
                  .attr("font-size", "12px")
                  .attr("opacity", 0)
                  .text("AM");

                const pmText = chart
                  .append("text")
                  .attr("x", 0)
                  .attr("y", 14)
                  .attr("text-anchor", "middle")
                  .attr("fill", "#C0C0C0")
                  .attr("font-size", "12px")
                  .attr("opacity", 0)
                  .text("PM");

                amText.transition().duration(500).attr("opacity", 1);
                pmText.transition().duration(500).attr("opacity", 1);

                // Draw bars with animation
                const sortedHourlyData = [...hourlyData].sort((a, b) => {
                  // Sort by hour in anticlockwise order starting from 9 o'clock (24/00)
                  const hourA = a.hour % 24;
                  const hourB = b.hour % 24;
                  return hourA - hourB;
                });

                // Function to draw a single bar with animation
                const drawBar = (data: HourlyData, index: number) => {
                  const hour = data.hour;
                  const angle = hour * angleStep + startAngle;
                  const barWidth = angleStep * 0.8;

                  // Draw total requests bar (gray)
                  const totalBarHeight = radiusScale(data.totalRequests);
                  const arcGenerator = d3
                    .arc()
                    .innerRadius(radius * 0.35)
                    .outerRadius(totalBarHeight)
                    .startAngle(angle - barWidth / 2)
                    .endAngle(angle + barWidth / 2)
                    .padAngle(0.02);

                  const totalBar = chart
                    .append("path")
                    .attr("d", arcGenerator({} as any) as string)
                    .attr("fill", "#4A4A54")
                    .attr("opacity", 0.8)
                    .append("title")
                    .text(
                      `Hour: ${hour}\nTotal Requests: ${data.totalRequests.toLocaleString()}`
                    );

                  // Draw failed requests bar (red)
                  if (data.failedRequests > 0) {
                    const failedRatio =
                      data.failedRequests / data.totalRequests;
                    const failedBarHeight =
                      radius * 0.35 +
                      (totalBarHeight - radius * 0.35) * failedRatio;

                    const failedArcGenerator = d3
                      .arc()
                      .innerRadius(radius * 0.35)
                      .outerRadius(failedBarHeight)
                      .startAngle(angle - barWidth / 2)
                      .endAngle(angle + barWidth / 2)
                      .padAngle(0.02);

                    const failedBar = chart
                      .append("path")
                      .attr("d", failedArcGenerator({} as any) as string)
                      .attr("fill", "#F40030")
                      .append("title")
                      .text(
                        `Hour: ${hour}\nFailed Requests: ${data.failedRequests.toLocaleString()} (${(
                          failedRatio * 100
                        ).toFixed(1)}%)`
                      );
                  }
                };

                // Draw bars sequentially with delay
                sortedHourlyData.forEach((data, index) => {
                  setTimeout(() => {
                    drawBar(data, index);
                  }, index * 50 + 1000); // Start bars after numbers appear (1000ms delay)
                });
              });
          });
      });

    hasAnimatedRef.current = true;
  }, [hourlyData, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="bg-transparent"
    />
  );
};

export default CircularBarChart;
