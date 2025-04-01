import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface LineChartProps {
  data: number[];
  width: number;
  height: number;
  color?: string;
}

const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  width, 
  height, 
  color = 'white'
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current);
    const margin = { top: 5, right: 5, bottom: 5, left: 5 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, chartWidth]);
      
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data) || 0])
      .range([chartHeight, 0]);
      
    // Create line generator
    const line = d3.line<number>()
      .x((_, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);
      
    // Create chart group
    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
      
    // Draw line
    chart.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line);
      
    // Add endpoint circle
    chart.append('circle')
      .attr('cx', xScale(data.length - 1))
      .attr('cy', yScale(data[data.length - 1]))
      .attr('r', 3)
      .attr('fill', color);
    
    // Add grid lines (optional)
    const gridLines = 5;
    for (let i = 1; i < gridLines; i++) {
      const y = chartHeight * (i / gridLines);
      chart.append('line')
        .attr('x1', 0)
        .attr('y1', y)
        .attr('x2', chartWidth)
        .attr('y2', y)
        .attr('stroke', '#333')
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '2,2');
    }
      
  }, [data, width, height, color]);
  
  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height}
      className="bg-transparent"
    />
  );
};

export default LineChart;
