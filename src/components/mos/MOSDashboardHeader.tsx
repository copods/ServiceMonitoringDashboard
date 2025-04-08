import React from 'react';

interface MOSDashboardHeaderProps {
  serviceName: string;
  currentTime: string;
  startTime: string;
}

const MOSDashboardHeader: React.FC<MOSDashboardHeaderProps> = ({
  serviceName,
  currentTime,
  startTime
}) => {
  return (
    <div className="bg-white p-4 shadow-sm rounded-lg mb-4">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800">{serviceName}</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">End Time:</span>
            <span className="font-medium">{currentTime}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Start Time:</span>
            <span className="font-medium">{startTime}</span>
          </div>
          
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700">
              Yesterday
            </button>
            <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700">
              Shift by 30 min
            </button>
            <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700">
              View Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MOSDashboardHeader;
