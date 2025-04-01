import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { HourlyData } from '../../../types/service';

interface CircularBarChartProps {
  hourlyData: HourlyData[];
  width: number;
  height: number;
}

const CircularBarChart: React.FC<CircularBarChartProps> = ({ hourlyData, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || hourlyData.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current);
    const radius = Math.min(width, height) / 2 - 10;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create a group for the chart
    const chart = svg.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);
    
    // Calculate the angle for each hour (24 hours)
    const angleStep = (2 * Math.PI) / 24;
    
    // Create scales for bar height
    const maxRequests = d3.max(hourlyData, d => d.totalRequests) || 0;
    const radiusScale = d3.scaleLinear()
      .domain([0, maxRequests])
      .range([0, radius * 0.8]);
    
    // Draw hour markers
    for (let i = 0; i < 24; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const isMainHour = i % 6 === 0;
      
      const outerX = radius * Math.cos(angle);
      const outerY = radius * Math.sin(angle);
      
      const innerX = (radius - 5) * Math.cos(angle);
      const innerY = (radius - 5) * Math.sin(angle);
      
      chart.append('line')
        .attr('x1', innerX)
        .attr('y1', innerY)
        .attr('x2', outerX)
        .attr('y2', outerY)
        .attr('stroke', '#555')
        .attr('stroke-width', isMainHour ? 2 : 1);
        
      if (isMainHour) {
        const labelX = (radius + 15) * Math.cos(angle);
        const labelY = (radius + 15) * Math.sin(angle);
        
        chart.append('text')
          .attr('x', labelX)
          .attr('y', labelY)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .text(i === 0 ? '24' : i.toString());
      }
    }
    
    // Draw AM/PM indicator in the center
    chart.append('text')
      .attr('x', 0)
      .attr('y', -8)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .text('AM');
      
    chart.append('text')
      .attr('x', 0)
      .attr('y', 8)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .text('PM');
    
    // Draw bars for each hour
    hourlyData.forEach(data => {
      const hour = data.hour;
      const angle = hour * angleStep - Math.PI / 2;
      
      // Calculate bar width
      const barWidth = angleStep * 0.7;
      
      // Draw total requests bar (grey)
      const totalBarHeight = radiusScale(data.totalRequests);
      const arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(totalBarHeight)
        .startAngle(angle - barWidth/2)
        .endAngle(angle + barWidth/2);
        
      chart.append('path')
        .attr('d', arcGenerator({} as any) as string)
        .attr('fill', '#555')
        .append('title')
        .text(`Hour: ${hour}\nTotal Requests: ${data.totalRequests.toLocaleString()}`);
        
      // Draw failed requests bar (red)
      if (data.failedRequests > 0) {
        const failedBarHeight = radiusScale(data.failedRequests);
        const failedArcGenerator = d3.arc()
          .innerRadius(0)
          .outerRadius(failedBarHeight)
          .startAngle(angle - barWidth/2)
          .endAngle(angle + barWidth/2);
          
        chart.append('path')
          .attr('d', failedArcGenerator({} as any) as string)
          .attr('fill', '#FF0000')
          .append('title')
          .text(`Hour: ${hour}\nFailed Requests: ${data.failedRequests.toLocaleString()}`);
      }
    });
    
    // Draw outer circle
    chart.append('circle')
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', '#444')
      .attr('stroke-width', 1);
    
  }, [hourlyData, width, height]);

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height}
      className="bg-gray-900"
    />
  );
};

export default CircularBarChart;
