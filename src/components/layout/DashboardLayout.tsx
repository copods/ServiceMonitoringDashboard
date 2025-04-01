import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
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
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="bg-black p-4 flex justify-between items-center">
        <div className="text-sm">{timeRangeDisplay}</div>
        <div className="text-xl font-bold">{location}</div>
        <div className="text-sm">UTC {format(new Date(currentTimestamp), 'H:mm')}</div>
        <div className="text-sm">{formattedDate}</div>
      </header>
      <main className="flex-1 p-4">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
