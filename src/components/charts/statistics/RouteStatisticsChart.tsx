// src/components/charts/statistics/RouteStatisticsChart.tsx
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Location, MonthlyStatistic } from 'types/network';

interface RouteStatisticsChartProps {
  sourceLocation: Location;
  destinationLocation: Location;
  statistics: MonthlyStatistic[];
  width: number;
  height: number;
}

const RouteStatisticsChart: React.FC<RouteStatisticsChartProps> = ({
  sourceLocation,
  destinationLocation,
  statistics,
  width,
  height
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || statistics.length === 0 || width <= 0 || height <= 0) return; // Added width/height check

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Ensure dimensions are positive
    if (innerWidth <= 0 || innerHeight <= 0) return;

    // Create chart group
    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create months for x-axis (similar to design image)
    const months = ['April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec', 'Jan'];
    
    // Create scales
    const xScale = d3.scaleBand()
      .domain(months)
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, 200])  // Fixed domain as per the design
      .range([innerHeight, 0]);

    // Draw horizontal grid lines
    chart.selectAll('.gridline')
      .data([0, 25, 50, 150, 200])
      .enter()
      .append('line')
      .attr('class', 'gridline')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#444')
      .attr('stroke-dasharray', '2,2')
      .attr('stroke-width', 0.5);

    // Add x-axis
    chart.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'middle')
      .attr('fill', '#999')
      .attr('font-size', '10px');
      
    // Remove x-axis line
    chart.select('.domain').remove();

    // Add y-axis
    chart.append('g')
      .call(d3.axisLeft(yScale)
        .tickValues([0, 25, 50, 150, 200])
        .tickSize(0) // No tick lines
      )
      .call(g => g.select('.domain').remove()) // Remove y-axis line
      .selectAll('text')
      .attr('fill', '#999')
      .attr('font-size', '10px');

    // Draw bars (using dark blue as in design)
    chart.selectAll('.bar')
      .data(months)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d) || 0)
      .attr('y', d => {
        // Generate random heights for demo purposes, similar to design
        const val = d === 'Sept' ? 140 : 
                   d === 'Oct' ? 120 : 
                   d === 'Nov' ? 130 : 
                   Math.floor(Math.random() * 100) + 50;
        return yScale(val);
      })
      .attr('width', xScale.bandwidth())
      .attr('height', d => {
        const val = d === 'Sept' ? 140 : 
                   d === 'Oct' ? 120 : 
                   d === 'Nov' ? 130 : 
                   Math.floor(Math.random() * 100) + 50;
        return innerHeight - yScale(val);
      })
      .attr('fill', '#4a5db0'); // Dark blue to match design

    // Add line for trends
    const lineData = months.map(month => {
      let val;
      if (month === 'July') val = 120;
      else if (month === 'Aug') val = 135;
      else if (month === 'Sept') val = 140;
      else if (month === 'Oct') val = 120;
      else if (month === 'Nov') val = 130;
      else if (month === 'Dec') val = 110;
      else val = Math.floor(Math.random() * 50) + 90;
      
      return { month, value: val };
    });
    
    const line = d3.line<{month: string, value: number}>()
      .x(d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .y(d => yScale(d.value));

    chart.append('path')
      .datum(lineData)
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-width', 1.5)
      .attr('d', line);

    // Add dots on line
    chart.selectAll('.dot')
      .data(lineData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d.value))
      .attr('r', 3.5)
      .attr('fill', '#000')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    // Add chart title (Denver > Pune)
    svg.append('text')
      .attr('x', margin.left)
      .attr('y', 10) // Position title within top margin
      .attr('fill', '#999')
      .attr('font-size', '12px')
      .text(`${sourceLocation.name} > ${destinationLocation.name}`);

  }, [sourceLocation, destinationLocation, statistics, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="bg-transparent" // Ensure background is transparent
    />
  );
};

export default RouteStatisticsChart;
