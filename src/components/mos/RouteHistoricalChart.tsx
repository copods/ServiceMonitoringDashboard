import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { HistoricalData } from '../../types/mos';

interface RouteHistoricalChartProps {
  data: HistoricalData[];
}

const RouteHistoricalChart: React.FC<RouteHistoricalChartProps> = ({ data }) => {
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    // Setup dimensions
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = chartRef.current.clientHeight - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select(chartRef.current)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([0, width])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.ingressValue, d.egressValue)) || 200])
      .range([height, 0])
      .nice();

    // Define colors
    const colors = {
      ingress: '#3b82f6', // Blue
      egress: '#8b5cf6'   // Purple
    };

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(yScale));
    
    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Value (0-200)');

    // Create the bars for ingress data
    svg.selectAll('.bar-ingress')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar-ingress')
      .attr('x', d => xScale(d.month) || 0)
      .attr('width', xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.ingressValue))
      .attr('height', d => height - yScale(d.ingressValue))
      .attr('fill', colors.ingress)
      .attr('rx', 2);

    // Create the bars for egress data
    svg.selectAll('.bar-egress')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar-egress')
      .attr('x', d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .attr('width', xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.egressValue))
      .attr('height', d => height - yScale(d.egressValue))
      .attr('fill', colors.egress)
      .attr('rx', 2);

    // Create a line for ingress trend
    const lineIngress = d3.line<HistoricalData>()
      .x(d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .y(d => yScale(d.ingressValue))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')  // Amber
      .attr('stroke-width', 2)
      .attr('d', lineIngress);

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 100}, 0)`);

    // Ingress legend item
    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', colors.ingress);

    legend.append('text')
      .attr('x', 20)
      .attr('y', 10)
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Ingress');

    // Egress legend item
    legend.append('rect')
      .attr('x', 0)
      .attr('y', 20)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', colors.egress);

    legend.append('text')
      .attr('x', 20)
      .attr('y', 30)
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Egress');

  }, [data]);

  return (
    <svg
      ref={chartRef}
      className="w-full h-full overflow-visible"
      preserveAspectRatio="xMidYMid meet"
    ></svg>
  );
};

export default RouteHistoricalChart;
