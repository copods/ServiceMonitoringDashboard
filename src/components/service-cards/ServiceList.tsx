import React from 'react';
import { Service } from 'types/service';
import { Domain } from 'types/domain';
import { Icon } from 'components/common/Icon';
import LineChart from 'components/charts/line-chart/LineChart';

interface ServiceListProps {
  services: Service[];
  domains: Domain[];
  onServiceSelect?: (serviceId: string) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({ services, domains, onServiceSelect }) => {
  if (services.length === 0) {
    return (
      <div className="bg-[#232429] p-6 rounded text-center">
        <p className="text-gray-400">No additional services to display.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="max-h-[500px] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {services.map(service => {
          const domain = domains.find(d => d.id === service.domainId) || { 
            id: '', 
            name: 'Unknown', 
            colorCode: '#666',
            totalServices: 0,
            criticalServices: 0
          };
          
          // Sort hourly data by hour to ensure it's in chronological order
          const sortedHourlyData = [...service.hourlyData].sort((a, b) => a.hour - b.hour);
          
          // Take the most recent 6 hours of data to show a trend (shorter window)
          const currentHour = new Date().getHours();
          const recentHoursData = [];
          
          // Start from 5 hours ago and include current hour
          for (let i = 5; i >= 0; i--) {
            const hourToFind = (currentHour - i + 24) % 24; // Handle wrapping around midnight
            const hourData = sortedHourlyData.find(data => data.hour === hourToFind);
            if (hourData) {
              recentHoursData.push(hourData.totalRequests);
            } else {
              // If no data, add a placeholder
              recentHoursData.push(0);
            }
          }
          
          const hourlyTotalRequests = recentHoursData;
          
          return (
            <div 
              key={service.id}
              className="bg-[#212226] p-4 rounded shadow-md hover:bg-[#2A2B30] cursor-pointer transition-colors"
              onClick={() => onServiceSelect && onServiceSelect(service.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-white truncate mr-2">{service.name}</div>
                <Icon domain={domain} border={false} />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-baseline">
                  <div className="flex items-baseline mr-3">
                    <span className="text-2xl font-bold mr-1">{service.alerts}</span>
                    <span className="text-xs text-gray-400">Alerts</span>
                  </div>
                  {service.criticalAlerts > 0 && (
                    <div className="flex items-baseline">
                      <span className="bg-red-500 w-2 h-2 mr-1"></span>
                      <span className="text-2xl font-bold mr-1">{service.criticalAlerts}</span>
                      <span className="text-xs text-gray-400">Critical</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="h-8 w-[120px]" title={`Last Hour Trend: ${hourlyTotalRequests[hourlyTotalRequests.length-1].toLocaleString()} requests in the most recent hour`}>
                    <LineChart 
                      data={hourlyTotalRequests}
                      width={120}
                      height={32}
                      color="white"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default ServiceList;