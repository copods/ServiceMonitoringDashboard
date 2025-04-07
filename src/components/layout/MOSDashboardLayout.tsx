import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { format } from 'date-fns';

interface MOSDashboardLayoutProps {
  children: React.ReactNode;
}

const MOSDashboardLayout: React.FC<MOSDashboardLayoutProps> = ({ children }) => {
  const { serviceDetails } = useSelector((state: RootState) => state.network);
  const { timeRange } = useSelector((state: RootState) => state.ui);

  // Default time range if not set
  const defaultStartTime = new Date();
  defaultStartTime.setHours(0, 0, 0, 0);
  const defaultEndTime = new Date();
  defaultEndTime.setHours(23, 59, 59, 999);

  const startTime = format(timeRange?.start ? new Date(timeRange.start) : defaultStartTime, 'hh:mm a');
  const endTime = format(timeRange?.end ? new Date(timeRange.end) : defaultEndTime, 'hh:mm a');
  const datePart = format(new Date(), 'MM/dd/yy');

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white mos-dashboard">
      <header className="bg-black py-1 px-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <div className="text-sm font-bold">Web Service 2</div>
          
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <div className="bg-gray-800 px-2 py-1 rounded">
              <div className="text-white">08.12.14</div>
              <div>05:30 pm IST</div>
            </div>
            <div className="bg-gray-800 px-2 py-1 rounded">
              <div className="text-white">Yesterday</div>
              <div className="flex justify-center">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="bg-gray-800 px-2 py-1 rounded">
              <div className="text-white">30 min</div>
              <div className="flex justify-center">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <div className="bg-gray-800 px-2 py-1 rounded">
              <div className="text-white">08.12.14</div>
              <div>07:30 pm IST</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-gray-400 text-xs">View:</span>
          <div className="flex items-center space-x-1 text-xs">
            <div className="bg-gray-800 px-2 py-1 rounded text-white">Default</div>
            <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {/* Header icons */}
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      <div className="bg-gray-800 p-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">
            56.9% MoS Degradation leaving Denver
          </h1>
          <div className="text-gray-400">
            Application: {serviceDetails.application} | VLAN: {serviceDetails.vlan} | Codec: {serviceDetails.codec}
          </div>
        </div>
      </div>
      
      <main className="flex-1 p-4 bg-gray-900">
        {children}
      </main>
    </div>
  );
};

export default MOSDashboardLayout;
