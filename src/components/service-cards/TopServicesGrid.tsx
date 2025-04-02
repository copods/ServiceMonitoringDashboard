import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import ServiceCard from './ServiceCard';

interface TopServicesGridProps {
  onServiceSelect?: (serviceId: string) => void;
}

const TopServicesGrid: React.FC<TopServicesGridProps> = ({ onServiceSelect }) => {
  const services = useSelector((state: RootState) => state.services.items);
  const topServiceIds = useSelector((state: RootState) => state.services.topCritical);
  const domains = useSelector((state: RootState) => state.domains);
  
  // Get top 6 services
  const topServices = services.filter(service => 
    topServiceIds.includes(service.id)
  );
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
      {topServices.map(service => {
        const domain = domains.find(d => d.id === service.domainId);
        return (
          <ServiceCard 
            key={service.id}
            service={service}
            domain={domain ? domain : { id: '', name: '', colorCode: '', totalServices: 0, criticalServices: 0 }}
            onClick={onServiceSelect ? () => onServiceSelect(service.id) : undefined}
          />
        );
      })}
      {/* Display placeholders if we have fewer than 6 services */}
      {topServices.length < 6 && Array.from({ length: 6 - topServices.length }).map((_, index) => (
        <div 
          key={`placeholder-${index}`} 
          className="bg-[#2E2F34] p-6 rounded shadow-md opacity-50 flex items-center justify-center"
        >
          <span className="text-gray-400">No critical service</span>
        </div>
      ))}
    </div>
  );
};

export default TopServicesGrid;
