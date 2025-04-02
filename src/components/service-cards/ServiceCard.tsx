import React from 'react';
import { Service } from 'types/service';
import CircularBarChart from 'components/charts/circular-bar/CircularBarChart';
import { Icon } from '../common/Icon';
import { Domain } from 'types/domain';

interface ServiceCardProps {
  service: Service;
  domain: Domain
  onClick?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  domain,
  onClick
}) => {
  return (
    <div
      className="bg-[#27282D] py-2 px-4 rounded shadow-md hover:shadow-lg transition-all"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex-1">
          <h3 className="text-l font-medium text-white mb-1 drop-shadow-sm">{service.name}</h3>
        </div>

        <div className="text-right">
          <Icon domain={domain} border={false} />
        </div>
      </div>
      
      <div className="relative">
        {/* Chart container with padding to create space */}
        <div className="flex justify-center pl-2 pt-5">
          <CircularBarChart
            hourlyData={service.hourlyData}
            width={220}
            height={220}
          />
        </div>
        
        {/* Floating div positioned absolutely over the chart */}
        <div className="absolute top-0 left-0 z-10">
          <div className="flex items-baseline">
            <span className="bg-red-500 w-2 h-2 mr-2"></span>
            <span className="text-xl font-bold">{service.criticalityPercentage}
              <span className="text-xl">%</span>
            </span>
          </div>
          <div className="text-base text-gray-400 mt-1">
            {(service.totalRequests / 1000).toFixed(1)}K
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;