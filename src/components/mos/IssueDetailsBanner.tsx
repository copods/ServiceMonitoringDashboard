import React from 'react';

interface IssueDetailsBannerProps {
  mainNode: string;
  degradationPercentage: number;
  application: string;
  vlan: string;
  codec: string;
}

const IssueDetailsBanner: React.FC<IssueDetailsBannerProps> = ({
  mainNode,
  degradationPercentage,
  application,
  vlan,
  codec
}) => {
  return (
    <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded-lg mb-4">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <div className="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {degradationPercentage}% MoS Degradation leaving {mainNode}
            </h2>
          </div>
        </div>
        
        <div className="flex space-x-6 mt-2 md:mt-0">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Application</span>
            <span className="font-medium">{application}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">VLAN</span>
            <span className="font-medium">{vlan}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Codec</span>
            <span className="font-medium">{codec}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsBanner;
