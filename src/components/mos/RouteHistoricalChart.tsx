import React, { useRef, useLayoutEffect, memo, useState } from "react";
import * as d3 from "d3";
import { HistoricalData } from "types/mos";

interface RouteHistoricalChartProps {
  data: HistoricalData[];
}

// Use React.memo to prevent unnecessary re-renders when props haven't changed
const RouteHistoricalChart = memo(({ data }: RouteHistoricalChartProps) => {
  const chartRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Add state for transition tracking
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Use key to force chart rerender on data change
  const dataKey = data.map(d => `${d.month}-${d.ingressValue}`).join('|');

  // Use useLayoutEffect for measurements before paint
  useLayoutEffect(() => {
    if (!chartRef.current || !containerRef.current || !data.length) return;

    // Indicate transition is starting
    setIsTransitioning(true);

    // Use a timeout to allow React to render any loading indicators
    const timeoutId = setTimeout(() => {
      // Clear previous chart
      d3.select(chartRef.current).selectAll("*").remove();

      // Setup dimensions based on container
      const margin = { top: 10, right: 10, bottom: 20, left: 30 };
      const containerWidth = containerRef.current?.clientWidth || 300;
      const containerHeight = containerRef.current?.clientHeight || 200;

      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - margin.top - margin.bottom;

      // Ensure dimensions are positive
      if (width <= 0 || height <= 0) {
        setIsTransitioning(false);
        return;
      }

      // Create the SVG container within the chartRef SVG
      const svg = d3
        .select(chartRef.current)
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Define scales
      const xScale = d3
        .scaleBand<string>()
        .domain(data.map((d) => d.month))
        .range([0, width])
        .padding(0.6);

      // Dynamically calculate y-scale domain from data
      const maxValue = d3.max(data, d => Math.max(d.ingressValue, d.egressValue)) || 200;
      const yScale = d3
        .scaleLinear()
        .domain([0, Math.ceil(maxValue / 50) * 50]) // Round up to nearest 50
        .range([height, 0]);

      // Define colors
      const barColor = "#3845a3"; // Blue for bars
      const lineColor = "#000000"; // Black for line and dots
      const gridColor = "#e5e7eb"; // Light gray for grid
      const axisColor = "#6b7280"; // Gray for axis text/lines

      // Add horizontal grid lines at specific values
      const gridCount = 5;
      const gridStep = Math.ceil(maxValue / gridCount / 50) * 50;
      const gridValues = Array.from({ length: gridCount + 1 }, (_, i) => i * gridStep);

      svg
        .selectAll(".grid-line")
        .data(gridValues)
        .enter()
        .append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", (d) => yScale(d))
        .attr("y2", (d) => yScale(d))
        .attr("stroke", gridColor)
        .attr("stroke-width", 0.5);

      // Add X axis
      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(
          d3
            .axisBottom(xScale)
            .tickSize(0)
            .tickPadding(8),
        )
        .attr("font-size", "9px")
        .attr("color", axisColor)
        .select(".domain")
        .attr("stroke", "none");

      // Add Y axis
      svg
        .append("g")
        .call(
          d3
            .axisLeft(yScale)
            .tickValues(gridValues)
            .tickSize(0)
            .tickPadding(8),
        )
        .attr("font-size", "9px")
        .attr("color", axisColor)
        .select(".domain")
        .attr("stroke", "none");

      // Create the bars
      svg
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => xScale(d.month) ?? 0)
        .attr("width", xScale.bandwidth())
        .attr("y", height) // Start at bottom for animation
        .attr("height", 0) // Start with height 0 for animation
        .attr("fill", barColor)
        .transition() // Add transition
        .duration(500)
        .delay((_, i) => i * 50) // Stagger effect
        .attr("y", (d) => yScale(d.ingressValue))
        .attr("height", (d) => height - yScale(d.ingressValue));

      // Create a line generator for trend
      const lineGenerator = d3
        .line<HistoricalData>()
        .x((d) => (xScale(d.month) ?? 0) + xScale.bandwidth() / 2)
        .y((d) => yScale(d.ingressValue))
        .curve(d3.curveMonotoneX);

      // Add the line path with transition
      const path = svg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", lineColor)
        .attr("stroke-width", 1.5)
        .attr("d", lineGenerator);

      // Add line animation
      const pathLength = path.node()?.getTotalLength() || 0;
      path
        .attr("stroke-dasharray", pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(1000)
        .attr("stroke-dashoffset", 0);

      // Add dots on the line with transition
      svg
        .selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", (d) => (xScale(d.month) ?? 0) + xScale.bandwidth() / 2)
        .attr("cy", (d) => yScale(d.ingressValue))
        .attr("r", 0) // Start with radius 0 for animation
        .attr("fill", lineColor)
        .transition()
        .duration(500)
        .delay((_, i) => 1000 + i * 50) // Start after line animation
        .attr("r", 3);

      // Indicate transition is complete
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1500); // Slightly longer than the animations
    }, 50);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [data, dataKey]); // Using dataKey as dependency ensures the chart updates when data changes

  return (
    // Container div to measure dimensions
    <div ref={containerRef} className="w-full h-full relative">
      {isTransitioning && (
        <div className="absolute inset-0 bg-white bg-opacity-30 flex items-center justify-center">
          <div className="w-6 h-6 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      <svg
        ref={chartRef}
        className="w-full h-full block"
        preserveAspectRatio="xMidYMid meet"
      ></svg>
    </div>
  );
});

export default RouteHistoricalChart;
