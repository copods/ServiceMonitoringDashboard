import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'store';

const DomainOverview: React.FC = () => {
  const domains = useSelector((state: RootState) => state.domains);

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {domains.map((domain) => (
        <div key={domain.id} className="bg-gray-800 p-4 rounded">
          <div className="flex items-center">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
              style={{ backgroundColor: domain.colorCode }}
            >
              <span className="text-white font-bold">{domain.id}</span>
            </div>
            <h3 className="text-lg font-medium">{domain.name}</h3>
          </div>
          <div className="flex items-center mt-2">
            <span className="text-3xl font-bold mr-2">{domain.totalServices}</span>
            <span className="text-sm text-gray-400">Services</span>
            <span className="ml-4 text-2xl font-bold text-red-500">{domain.criticalServices}</span>
            <span className="text-sm text-gray-400 ml-1">Critical</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DomainOverview;
