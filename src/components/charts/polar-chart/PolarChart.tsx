import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Service } from 'types/service';
import { Domain } from 'types/domain';

interface PolarChartProps {
  services: Service[];
  domains: Domain[];
  width: number;
  height: number;
  onServiceSelect?: (serviceId: string) => void;
}

const PolarChart: React.FC<PolarChartProps> = ({ 
  services, 
  domains, 
  width, 
  height,
  onServiceSelect
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || services.length === 0 || domains.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current);
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create a group for the chart
    const chart = svg.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);
    
    // Draw circular sections
    chart.append('circle')
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', 1);
      
    // Draw inner circles at 25%, 50%, and 75%
    [0.25, 0.5, 0.75].forEach(factor => {
      chart.append('circle')
        .attr('r', radius * factor)
        .attr('fill', 'none')
        .attr('stroke', '#333')
        .attr('stroke-width', 1);
        
      // Add percentage labels
      chart.append('text')
        .attr('x', 0)
        .attr('y', -radius * factor - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .text(`${Math.round((1 - factor) * 100)}%`);
    });
    
    // Divide into domain sections
    const domainCount = domains.length;
    const angleSlice = (Math.PI * 2) / domainCount;
    
    // Draw domain dividers
    domains.forEach((_, i) => {
      const angle = angleSlice * i;
      chart.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', radius * Math.cos(angle - Math.PI/2))
        .attr('y2', radius * Math.sin(angle - Math.PI/2))
        .attr('stroke', '#333')
        .attr('stroke-width', 1);
    });
    
    // Plot services
    services.forEach(service => {
      // Find domain index
      const domainIndex = domains.findIndex(d => d.id === service.domainId);
      if (domainIndex === -1) return;
      
      // Calculate position based on importance and domain
      const baseAngle = angleSlice * domainIndex - Math.PI/2;
      const randomOffset = (Math.random() - 0.5) * (angleSlice * 0.8);
      const angle = baseAngle + randomOffset;
      
      // Distance from center based on importance (0-100)
      // More important = closer to center
      const distance = radius * (1 - service.importance / 100);
      
      const x = distance * Math.cos(angle);
      const y = distance * Math.sin(angle);
      
      // Bubble size based on total requests
      const size = Math.max(5, Math.min(30, Math.sqrt(service.totalRequests) / 10));
      
      // Bubble color based on status
      const color = service.status === 'critical' 
        ? '#FF0000' 
        : service.status === 'warning' 
          ? '#FFCC00' 
          : '#808080';
      
      // Create service bubble
      const bubble = chart.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', size)
        .attr('fill', color)
        .attr('opacity', 0.8)
        .attr('stroke', '#333')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer');
        
      // Add tooltip on hover
      bubble.append('title')
        .text(`${service.name}\nRequests: ${service.totalRequests.toLocaleString()}\nCriticality: ${service.criticalityPercentage}%`);
        
      // Add click event
      if (onServiceSelect) {
        bubble.on('click', () => {
          onServiceSelect(service.id);
        });
      }
    });
    
    // Add domain labels
    domains.forEach((domain, i) => {
      const angle = angleSlice * i - Math.PI/2;
      const labelRadius = radius + 20;
      const x = labelRadius * Math.cos(angle);
      const y = labelRadius * Math.sin(angle);
      
      // Add domain indicator circle
      chart.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 15)
        .attr('fill', domain.colorCode);
        
      // Add domain ID
      chart.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(domain.id);
    });
    
    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(20, 20)`);
      
    const statuses = [
      { label: 'Normal', color: '#808080' },
      { label: 'Warning', color: '#FFCC00' },
      { label: 'Critical', color: '#FF0000' }
    ];
    
    statuses.forEach((status, i) => {
      legend.append('circle')
        .attr('cx', 10)
        .attr('cy', i * 25)
        .attr('r', 6)
        .attr('fill', status.color);
        
      legend.append('text')
        .attr('x', 25)
        .attr('y', i * 25 + 4)
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .text(status.label);
    });
    
  }, [services, domains, width, height, onServiceSelect]);

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height}
      className="bg-gray-900"
    />
  );
};

export default PolarChart;
