import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Location, Route } from 'types/network';

interface NetworkFlowChartProps {
  sourceLocation: Location;
  destinationLocations: Location[];
  routes: Route[];
  width: number;
  height: number;
  onRouteSelect: (routeId: string) => void;
}

const NetworkFlowChart: React.FC<NetworkFlowChartProps> = ({
  sourceLocation,
  destinationLocations,
  routes,
  width,
  height,
  onRouteSelect
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !sourceLocation || destinationLocations.length === 0 || routes.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 40, right: 120, bottom: 60, left: 100 }; // Increased bottom margin for legend
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main chart group
    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Source node position (Denver)
    const sourceX = 0;
    const sourceY = innerHeight / 2;

    // Sort destinations by impact percentage (descending)
    const sortedDestinations = [...destinationLocations].sort((a, b) => {
      const routeA = routes.find(r => r.sourceId === sourceLocation.id && r.destinationId === a.id);
      const routeB = routes.find(r => r.sourceId === sourceLocation.id && r.destinationId === b.id);
      return (routeB?.impactedPercentage || 0) - (routeA?.impactedPercentage || 0);
    });

    // Draw source node (Denver)
    const sourceNode = chart.append('g')
      .attr('class', 'source-node')
      .attr('transform', `translate(${sourceX}, ${sourceY})`);

    sourceNode.append('circle')
      .attr('r', 40)
      .attr('fill', '#3498db')
      .attr('stroke', '#2980b9')
      .attr('stroke-width', 2);

    // Source node icon (crosshair)
    sourceNode.append('path')
      .attr('d', 'M0,-15 L0,15 M-15,0 L15,0')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    sourceNode.append('circle')
      .attr('r', 5)
      .attr('fill', 'white');

    // Source node label
    sourceNode.append('text')
      .attr('x', 0)
      .attr('y', 60)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '14px')
      .text(sourceLocation.name);

    sourceNode.append('text')
      .attr('x', 0)
      .attr('y', 78)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .text(`${56.9}% MoS`); // Hardcoded as per design

    // Calculate destination node positions
    const destinationSpacing = innerHeight / (sortedDestinations.length + 1);
    const destinationX = innerWidth;

    // Draw connections and destination nodes
    sortedDestinations.forEach((destination, index) => {
      const destinationY = (index + 1) * destinationSpacing;
      
      // Find the route for this destination
      const route = routes.find(r => 
        r.sourceId === sourceLocation.id && r.destinationId === destination.id
      );
      
      if (!route) return; // Skip if no route found
      
      // Create path for the connection
      const pathData = d3.path();
      pathData.moveTo(sourceX, sourceY);
      
      // Create a curved path more pronounced for nodes further from vertical center
      const yDiff = destinationY - sourceY;
      const controlPointY = sourceY + (yDiff * 0.5);
      const controlPointX = sourceX + (destinationX - sourceX) * 0.5;
      
      pathData.bezierCurveTo(
        controlPointX, sourceY + (yDiff * 0.2),
        controlPointX, destinationY - (yDiff * 0.2),
        destinationX, destinationY
      );
      
      // Connection line
      const connection = chart.append('path')
        .attr('d', pathData.toString())
        .attr('fill', 'none')
        .attr('stroke', '#666')
        .attr('stroke-width', 1.5)
        .attr('cursor', 'pointer')
        .attr('class', `route-path route-path-${route.id}`) // Added generic class
        .on('click', () => {
          setSelectedRouteId(route.id);
          onRouteSelect(route.id);
        })
        .on('mouseover', function() {
          d3.select(this).attr('stroke', '#999').attr('stroke-width', 2);
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('stroke', selectedRouteId === route.id ? '#999' : '#666')
            .attr('stroke-width', selectedRouteId === route.id ? 2 : 1.5);
        });
      
      // If route is selected, highlight it
      if (selectedRouteId === route.id) {
        connection.attr('stroke', '#999').attr('stroke-width', 2);
      }
      
      // Impact indicator group (positioned at midpoint of the path)
      const pathLength = connection.node()?.getTotalLength() || 0;
      const midpoint = connection.node()?.getPointAtLength(pathLength / 2) || { x: 0, y: 0 };
      
      const impactGroup = chart.append('g')
        .attr('transform', `translate(${midpoint.x}, ${midpoint.y})`)
        .attr('class', 'impact-indicator');

      impactGroup.append('circle')
        .attr('r', 15)
        .attr('fill', 'none')
        .attr('stroke', '#e74c3c')
        .attr('stroke-width', 2);
      
      // Create impact percentage fill
      impactGroup.append('path')
        .attr('d', d3.arc()({
          innerRadius: 0,
          outerRadius: 15,
          startAngle: 0,
          endAngle: 2 * Math.PI * (route.impactedPercentage / 100)
        }) || '') // Added fallback for null
        .attr('fill', '#e74c3c')
        .attr('opacity', 0.8)
        .append('title')
        .text(`${route.impactedPercentage}% Impacted`);
      
      // Add impact percentage label
      impactGroup.append('text')
        .attr('x', 0)
        .attr('y', 5) // Adjusted y position
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '10px')
        .text(`${route.impactedPercentage}%`);
      
      // Add stream count label above the indicator
      chart.append('text')
        .attr('x', midpoint.x)
        .attr('y', midpoint.y - 20) // Positioned above the circle
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '10px')
        .text(`${route.totalStreams / 1000}k streams`);
      
      // Draw destination node
      const destinationNode = chart.append('g')
        .attr('class', 'destination-node')
        .attr('transform', `translate(${destinationX}, ${destinationY})`)
        .attr('cursor', 'pointer')
        .on('click', () => {
          setSelectedRouteId(route.id);
          onRouteSelect(route.id);
        });
      
      destinationNode.append('circle')
        .attr('r', 25)
        .attr('fill', 'white')
        .attr('stroke', '#666')
        .attr('stroke-width', 1);
      
      // Destination node icon (different crosshair)
      destinationNode.append('path')
        .attr('d', 'M0,-8 L0,8 M-8,0 L8,0')
        .attr('stroke', '#333')
        .attr('stroke-width', 1.5);
      
      destinationNode.append('circle')
        .attr('r', 3)
        .attr('fill', '#333');
      
      // Destination label
      destinationNode.append('text')
        .attr('x', 35)
        .attr('y', 0)
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '14px')
        .text(destination.name);
      
      // Degradation percentage
      destinationNode.append('text')
        .attr('x', 35)
        .attr('y', 18)
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#999')
        .attr('font-size', '12px')
        .text(`${route.degradationPercentage}% Deg`);
    });
    
    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${height - margin.bottom + 20})`); // Adjusted position
    
    // Ingress icon group
    const ingressLegend = legend.append('g')
      .attr('transform', 'translate(20, 0)');
      
    ingressLegend.append('circle')
      .attr('r', 8)
      .attr('fill', '#3498db');
    
    ingressLegend.append('path')
      .attr('d', 'M0,-3 L0,3 M-3,0 L3,0')
      .attr('stroke', 'white')
      .attr('stroke-width', 1);
    
    ingressLegend.append('text')
      .attr('x', 15) // Adjusted position
      .attr('y', 0)
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .text('Ingress');
    
    // Egress icon group
    const egressLegend = legend.append('g')
      .attr('transform', 'translate(100, 0)'); // Adjusted position
      
    egressLegend.append('circle')
      .attr('r', 8)
      .attr('fill', 'white')
      .attr('stroke', '#666');
    
    egressLegend.append('path')
      .attr('d', 'M0,-3 L0,3 M-3,0 L3,0')
      .attr('stroke', '#333')
      .attr('stroke-width', 1);
    
    egressLegend.append('text')
      .attr('x', 15) // Adjusted position
      .attr('y', 0)
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .text('Egress');
    
  }, [sourceLocation, destinationLocations, routes, width, height, selectedRouteId, onRouteSelect]);

  return (
    <div className="network-flow-chart bg-gray-800 p-4 rounded"> {/* Added background and padding */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{sourceLocation?.name || '...'}</h3>
        <div className="text-sm text-gray-400">
          Sort By: Impact from {sourceLocation?.name || '...'}
        </div>
      </div>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-transparent" // Changed to transparent background
        viewBox={`0 0 ${width} ${height}`} // Added viewBox for better scaling
        preserveAspectRatio="xMidYMid meet" // Maintain aspect ratio
      />
    </div>
  );
};

export default NetworkFlowChart;
