import React from 'react';
import { Service } from '../../types/service';
import { Domain } from '../../types/domain';

interface ServiceListProps {
  services: Service[];
  domains: Domain[];
  onServiceSelect?: (serviceId: string) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({ services, domains, onServiceSelect }) => {
  if (services.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded shadow text-center">
        <p className="text-gray-400">No additional services to display.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded shadow overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-900">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Service
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Domain
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Criticality
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Requests
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Failed
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Alerts
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {services.map(service => {
            const domain = domains.find(d => d.id === service.domainId);
            const statusColor = 
              service.status === 'critical' ? 'bg-red-500' :
              service.status === 'warning' ? 'bg-yellow-500' : 'bg-gray-500';
            
            return (
              <tr 
                key={service.id} 
                className="hover:bg-gray-700 cursor-pointer"
                onClick={() => onServiceSelect && onServiceSelect(service.id)}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-medium">{service.name}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <span 
                      className="inline-block w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: domain?.colorCode || '#666' }}
                    >
                    </span>
                    <span>{domain?.name || 'Unknown'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${statusColor} mr-2`}></span>
                    <span className="capitalize">{service.status}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-bold">{service.criticalityPercentage}%</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {service.totalRequests.toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-red-500">{service.failedRequests.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span>{service.alerts}</span>
                  {service.criticalAlerts > 0 && (
                    <span className="ml-1 text-red-500">({service.criticalAlerts} critical)</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceList;
