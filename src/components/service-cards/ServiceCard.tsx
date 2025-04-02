import React from 'react';
import { Service } from 'types/service';
import CircularBarChart from 'components/charts/circular-bar/CircularBarChart';

interface ServiceCardProps {
  service: Service;
  domainColor: string;
  domainId: string;
  onClick?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  domainColor, 
  domainId,
  onClick
}) => {
  const statusColor = 
    service.status === 'critical' ? 'bg-red-500' :
    service.status === 'warning' ? 'bg-yellow-500' : 'bg-gray-500';

  return (
    <div 
      className="bg-gray-800 p-4 rounded shadow-md hover:shadow-lg transition-all"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-medium">{service.name}</h3>
          <div className="flex items-center">
            <span 
              className="w-5 h-5 rounded-full mr-2 flex items-center justify-center"
              style={{ backgroundColor: domainColor }}
            >
              <span className="text-xs font-bold text-white">{domainId}</span>
            </span>
            <span className={`inline-block w-2 h-2 rounded-full ${statusColor} mr-1`}></span>
            <span className="text-sm text-gray-400 capitalize">{service.status}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center justify-end">
            <span className="text-red-500 mr-1">•</span>
            <span className="text-xl font-bold">{service.criticalityPercentage}%</span>
          </div>
          <div className="text-sm text-gray-400">
            {(service.totalRequests / 1000).toFixed(1)}K requests
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-2">
        <CircularBarChart 
          hourlyData={service.hourlyData}
          width={180}
          height={180}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
        <div>
          <span className="text-gray-400">Failed:</span>
          <span className="ml-1 text-red-500">{service.failedRequests.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-gray-400">Alerts:</span>
          <span className="ml-1">{service.alerts}</span>
          {service.criticalAlerts > 0 && (
            <span className="ml-1 text-red-500">({service.criticalAlerts} critical)</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
