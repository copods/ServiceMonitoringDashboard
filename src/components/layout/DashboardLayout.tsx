import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { format } from 'date-fns';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { location, currentTimestamp, timeRange } = useSelector((state: RootState) => state.ui);
  
  // Format the current timestamp for display
  const formattedDate = format(new Date(currentTimestamp), 'HH:mm \'HRS\' dd MMM yyyy EEEE').toUpperCase();
  
  // Format the time range
  const startTime = format(new Date(timeRange.start), 'h:mm a');
  const endTime = format(new Date(timeRange.end), 'h:mm a');
  const timeRangeDisplay = `1HR - ${startTime} TO ${endTime}`;
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white font-roboto">
      <header className="bg-black py-2 px-4 flex items-center border-b border-gray-800">
        <div className="text-sm font-medium flex-1 text-left">{timeRangeDisplay}</div>
        <div className="flex-1 flex font-medium justify-center items-center space-x-4">
          <div className="text-2xl tracking-widest">{location}</div>
          <div className="text-sm">UTC {format(new Date(currentTimestamp), 'H:mm')}</div>
        </div>
        <div className="text-sm font-medium flex-1 text-right">{formattedDate}</div>
      </header>
      <main className="flex-1 px-4 py-3">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;