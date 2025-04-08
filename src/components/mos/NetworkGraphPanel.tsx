import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Location, Route } from 'types/mos';

interface NetworkGraphPanelProps {
  locations: Location[];
  routes: Route[];
  onRouteSelected: (routeId: string) => void;
  selectedRouteId: string | null;
}

const NetworkGraphPanel: React.FC<NetworkGraphPanelProps> = ({
  locations,
  routes,
  onRouteSelected,
  selectedRouteId
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height: Math.max(height, 600) });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Render network graph with D3
  useEffect(() => {
    if (!svgRef.current || !locations.length || !routes.length) return;

    // Clear previous rendering
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;

    // Create layers for different elements
    const linksLayer = svg.append('g').attr('class', 'links-layer');
    const nodesLayer = svg.append('g').attr('class', 'nodes-layer');
    const labelsLayer = svg.append('g').attr('class', 'labels-layer');
    const metricsLayer = svg.append('g').attr('class', 'metrics-layer');

    // Prepare data
    const locationsMap = new Map(locations.map(loc => [loc.id, loc]));
    const denverLocation = locations.find(loc => loc.id === 'denver') || locations[0];
    const destinationLocations = locations.filter(loc => loc.id !== 'denver');

    // Create links/routes
    linksLayer.selectAll('line')
      .data(routes)
      .enter()
      .append('line')
      .attr('x1', d => denverLocation.coordinates?.x || width / 2)
      .attr('y1', d => denverLocation.coordinates?.y || height / 2)
      .attr('x2', d => {
        const dest = locationsMap.get(d.destinationId);
        return dest?.coordinates?.x || 0;
      })
      .attr('y2', d => {
        const dest = locationsMap.get(d.destinationId);
        return dest?.coordinates?.y || 0;
      })
      .attr('stroke', d => d.id === selectedRouteId ? '#3b82f6' : '#9ca3af')
      .attr('stroke-width', d => d.id === selectedRouteId ? 3 : 2)
      .attr('stroke-opacity', 0.8)
      .attr('class', 'cursor-pointer')
      .on('mouseover', function() {
        d3.select(this)
          .attr('stroke', '#3b82f6')
          .attr('stroke-width', 3);
      })
      .on('mouseout', function(event, d) {
        if (d.id !== selectedRouteId) {
          d3.select(this)
            .attr('stroke', '#9ca3af')
            .attr('stroke-width', 2);
        }
      })
      .on('click', (event, d) => {
        onRouteSelected(d.id);
      });

    // Create metrics cards on routes
    const metricsGroups = metricsLayer.selectAll('g')
      .data(routes)
      .enter()
      .append('g')
      .attr('transform', d => {
        const source = locationsMap.get(d.sourceId);
        const dest = locationsMap.get(d.destinationId);
        
        const sourceX = source?.coordinates?.x || width / 2;
        const sourceY = source?.coordinates?.y || height / 2;
        const destX = dest?.coordinates?.x || 0;
        const destY = dest?.coordinates?.y || 0;
        
        // Position metrics at 60% of the way from source to destination
        const x = sourceX + (destX - sourceX) * 0.6;
        const y = sourceY + (destY - sourceY) * 0.6;
        
        return `translate(${x}, ${y})`;
      })
      .attr('class', 'cursor-pointer')
      .on('click', (event, d) => {
        onRouteSelected(d.id);
      });

    // Create background card
    metricsGroups.append('rect')
      .attr('x', -40)
      .attr('y', -35)
      .attr('width', 80)
      .attr('height', 70)
      .attr('rx', 4)
      .attr('fill', 'white')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1);

    // MOS percentage
    metricsGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', d => d.mosPercentage < 50 ? '#ef4444' : '#3b82f6')
      .attr('y', -18)
      .text(d => `${d.mosPercentage}% MOS`);

    // Packet Loss percentage
    metricsGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#6b7280')
      .attr('y', 0)
      .text(d => `${d.packetLossPercentage.toFixed(1)}% PL`);

    // Stream count
    metricsGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#6b7280')
      .attr('y', 18)
      .text(d => `${(d.streamCount / 1000).toFixed(0)}k streams`);

    // Create central (Denver) node
    nodesLayer.append('circle')
      .attr('cx', denverLocation.coordinates?.x || width / 2)
      .attr('cy', denverLocation.coordinates?.y || height / 2)
      .attr('r', 25)
      .attr('fill', '#3b82f6')
      .attr('class', 'cursor-pointer');

    // Add Denver label
    labelsLayer.append('text')
      .attr('x', denverLocation.coordinates?.x || width / 2)
      .attr('y', denverLocation.coordinates?.y || height / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .attr('font-size', '12px')
      .attr('class', 'cursor-pointer')
      .text(denverLocation.name);

    // Create destination nodes
    const destinationNodes = nodesLayer.selectAll('.destination-node')
      .data(destinationLocations)
      .enter()
      .append('g')
      .attr('class', 'destination-node cursor-pointer')
      .on('click', (event, d) => {
        const route = routes.find(r => r.destinationId === d.id);
        if (route) {
          onRouteSelected(route.id);
        }
      });

    // Node circles
    destinationNodes.append('circle')
      .attr('cx', d => d.coordinates?.x || 0)
      .attr('cy', d => d.coordinates?.y || 0)
      .attr('r', 22)
      .attr('fill', 'white')
      .attr('stroke', d => {
        const route = routes.find(r => r.destinationId === d.id);
        return route?.id === selectedRouteId ? '#3b82f6' : '#9ca3af';
      })
      .attr('stroke-width', d => {
        const route = routes.find(r => r.destinationId === d.id);
        return route?.id === selectedRouteId ? 3 : 1.5;
      });

    // Node labels
    destinationNodes.append('text')
      .attr('x', d => d.coordinates?.x || 0)
      .attr('y', d => d.coordinates?.y || 0)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#374151')
      .attr('font-weight', 'medium')
      .attr('font-size', '11px')
      .text(d => d.name);

    // Impact percentage labels
    destinationNodes.each(function(d) {
      const node = d3.select(this);
      const route = routes.find(r => r.destinationId === d.id);
      
      if (route) {
        node.append('text')
          .attr('x', (d.coordinates?.x || 0) + 30)
          .attr('y', (d.coordinates?.y || 0) - 20)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('fill', route.impactPercentage > 80 ? '#ef4444' : '#3b82f6')
          .text(`${route.impactPercentage}%`);
      }
    });

  }, [locations, routes, selectedRouteId, dimensions, onRouteSelected]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-full" ref={containerRef}>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Network Topology</h2>
        <div className="text-sm text-gray-500">Sort By: Impact from Denver</div>
      </div>

      <div className="relative overflow-hidden" style={{ height: `${dimensions.height}px` }}>
        <svg 
          ref={svgRef}
          width={dimensions.width} 
          height={dimensions.height} 
          className="network-graph"
        />
      </div>
    </div>
  );
};

export default NetworkGraphPanel;
