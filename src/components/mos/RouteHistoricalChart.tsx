import React, { useRef, useEffect, useLayoutEffect } from "react";
import * as d3 from "d3";
import { HistoricalData } from "types/mos"; // Adjust path

interface RouteHistoricalChartProps {
  data: HistoricalData[];
}

const RouteHistoricalChart: React.FC<RouteHistoricalChartProps> = ({
  data,
}) => {
  const chartRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Ref for container div

  // Use useLayoutEffect for measurements before paint
  useLayoutEffect(() => {
    if (!chartRef.current || !containerRef.current || !data.length) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();

    // Setup dimensions based on container
    const margin = { top: 10, right: 10, bottom: 20, left: 30 }; // Adjusted margins
    // Get dimensions from the container div
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Ensure dimensions are positive
    if (width <= 0 || height <= 0) return;

    // Create the SVG container within the chartRef SVG
    const svg = d3
      .select(chartRef.current)
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`) // Make SVG responsive
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
    const xScale = d3
      .scaleBand<string>() // Explicitly type scaleBand
      .domain(data.map((d) => d.month))
      .range([0, width])
      .padding(0.6); // Adjust padding to make bars thinner

    const yScale = d3
      .scaleLinear()
      .domain([0, 200]) // Fixed scale [0, 200]
      .range([height, 0]);

    // Define colors
    const barColor = "#3845a3"; // Dark blue for bars
    const lineColor = "#000000"; // Black for line and dots
    const gridColor = "#e5e7eb"; // Light gray for grid
    const axisColor = "#6b7280"; // Gray for axis text/lines

    // Add horizontal grid lines at specific values
    const gridValues = [0, 25, 50, 150, 200];
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
      .attr("stroke-width", 0.5); // Thinner grid lines

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(0) // Remove tick marks
          .tickPadding(8), // Padding between ticks and text
      )
      .attr("font-size", "9px") // Smaller font
      .attr("color", axisColor)
      .select(".domain") // Hide the axis line
      .attr("stroke", "none");

    // Add Y axis
    svg
      .append("g")
      .call(
        d3
          .axisLeft(yScale)
          .tickValues(gridValues) // Only show ticks for grid lines
          .tickSize(0) // Remove tick marks
          .tickPadding(8), // Padding between ticks and text
      )
      .attr("font-size", "9px") // Smaller font
      .attr("color", axisColor)
      .select(".domain") // Hide the axis line
      .attr("stroke", "none");

    // Create the bars
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.month) ?? 0) // Use nullish coalescing
      .attr("width", xScale.bandwidth())
      .attr("y", (d) => yScale(d.ingressValue)) // Assuming ingressValue for bars
      .attr("height", (d) => height - yScale(d.ingressValue))
      .attr("fill", barColor);

    // Create a line generator for trend (using ingressValue for the line as well)
    const lineGenerator = d3
      .line<HistoricalData>()
      .x((d) => (xScale(d.month) ?? 0) + xScale.bandwidth() / 2) // Center line on bar
      .y((d) => yScale(d.ingressValue)) // Line follows ingressValue
      .curve(d3.curveMonotoneX); // Smooth curve

    // Add the line path
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", lineColor)
      .attr("stroke-width", 1.5) // Slightly thinner line
      .attr("d", lineGenerator);

    // Add dots on the line
    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => (xScale(d.month) ?? 0) + xScale.bandwidth() / 2)
      .attr("cy", (d) => yScale(d.ingressValue))
      .attr("r", 3) // Smaller dots
      .attr("fill", lineColor);

    // Legend removed as per UI analysis
  }, [data]); // Rerun effect if data changes

  return (
    // Container div to measure dimensions
    <div ref={containerRef} className="w-full h-full">
      <svg
        ref={chartRef}
        className="w-full h-full block" // Use block to prevent extra space below
        preserveAspectRatio="xMidYMid meet"
      ></svg>
    </div>
  );
};

export default RouteHistoricalChart;
