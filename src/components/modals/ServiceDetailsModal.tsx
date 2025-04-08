import React, { useEffect, useMemo, useCallback, memo } from 'react';
import { Service } from 'types/service';
import { Domain } from 'types/domain';
import CircularBarChart from 'components/charts/circular-bar/CircularBarChart';
import LineChart from 'components/charts/line-chart/LineChart';
import { toRoman } from 'utils';

interface ServiceDetailsModalProps {
  service: Service;
  domain?: Domain;
  onClose: () => void;
}

const STATUS_COLORS = {
  critical: '#FF0000',
  warning: '#FFCC00',
  default: '#808080'
};

const MetricsPanel = memo(({ service }: { service: Service }) => (
  <div className="bg-gray-700 p-4 rounded">
    <h3 className="text-lg font-semibold mb-2">Metrics</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-gray-400">Total Requests</p>
        <p className="text-xl font-bold">{service.totalRequests.toLocaleString()}</p>
      </div>
      <div>
        <p className="text-gray-400">Failed Requests</p>
        <p className="text-xl font-bold text-red-500">{service.failedRequests.toLocaleString()}</p>
      </div>
      <div>
        <p className="text-gray-400">Alerts</p>
        <p className="text-xl font-bold">
          {service.alerts}
          {service.criticalAlerts > 0 && (
            <span className="text-red-500 ml-2">({service.criticalAlerts} critical)</span>
          )}
        </p>
      </div>
      <div>
        <p className="text-gray-400">Importance</p>
        <p className="text-xl font-bold">{service.importance}%</p>
      </div>
    </div>
  </div>
));

const StatusPanel = memo(({ service, statusColor }: { service: Service, statusColor: string }) => (
  <div className="bg-gray-700 p-4 rounded mb-4">
    <h3 className="text-lg font-semibold mb-2">Status</h3>
    <div className="flex items-center">
      <span
        className="w-4 h-4 rounded-full mr-2"
        style={{ backgroundColor: statusColor }}
      />
      <span className="capitalize">{service.status}</span>
      <span className="ml-auto font-bold text-xl">{service.criticalityPercentage}%</span>
    </div>
  </div>
));

const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  service,
  domain,
  onClose
}) => {
  const hourlyTotalRequests = useMemo(() => 
    service.hourlyData.map(data => data.totalRequests), 
    [service.hourlyData]
  );
  
  const hourlyFailedRequests = useMemo(() => 
    service.hourlyData.map(data => data.failedRequests), 
    [service.hourlyData]
  );
  
  const [romanNumeral, setRomanNumeral] = React.useState<string>('');

  const statusColor = useMemo(() => 
    STATUS_COLORS[service.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default,
    [service.status]
  );

  useEffect(() => {
    if (domain) {
      const match = domain.id.match(/\d+$/);
      const number = match ? parseInt(match[0], 10) : NaN;
      setRomanNumeral(toRoman(number));
    }
  }, [domain]);
  
  const handleClose = useCallback(() => onClose(), [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
      <div className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-4 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center">
            {domain && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                style={{ backgroundColor: domain.colorCode }}
              >
                <span className="text-white font-bold">{romanNumeral}</span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">{service.name}</h2>
              <p className="text-gray-400">{domain?.name || 'Unknown Domain'}</p>
            </div>
          </div>

          <button
            className="text-gray-400 hover:text-white text-2xl focus:outline-none"
            onClick={handleClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <StatusPanel service={service} statusColor={statusColor} />
              <MetricsPanel service={service} />
            </div>

            <div className="bg-gray-700 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2">24 Hour Activity</h3>
              <div className="flex justify-center">
                <CircularBarChart
                  hourlyData={service.hourlyData}
                  width={300}
                  height={300}
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded">
            <h3 className="text-lg font-semibold mb-4">Request Trends</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium mb-2">Total Requests</h4>
                <LineChart
                  data={hourlyTotalRequests}
                  width={400}
                  height={200}
                  color="#3498db"
                />
              </div>
              <div>
                <h4 className="text-md font-medium mb-2">Failed Requests</h4>
                <LineChart
                  data={hourlyFailedRequests}
                  width={400}
                  height={200}
                  color="#e74c3c"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ServiceDetailsModal);
