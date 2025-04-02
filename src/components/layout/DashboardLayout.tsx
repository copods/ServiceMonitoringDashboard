import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { format } from 'date-fns';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { location, currentTimestamp, timeRange } = useSelector((state: RootState) => state.ui);

  const timePart = format(new Date(currentTimestamp), 'HH:mm').toUpperCase();
  const datePart = format(new Date(currentTimestamp), 'dd MMM yyyy EEEE').toUpperCase();
  const startTime = format(new Date(timeRange.start), 'h:mm a');
  const endTime = format(new Date(timeRange.end), 'h:mm a');

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white font-roboto">
      <header className="bg-black py-2 px-4 flex items-center border-b border-gray-800">
        {/* Time Range Display */}
        <div className="text-sm font-medium flex-1 text-left flex items-center space-x-3">
          <span> 1 HR - {startTime}</span><span>TO</span><span>{endTime}</span>
        </div>
        {/* Location and UTC Time */}
        <div className="flex-1 flex font-medium justify-center items-center space-x-4">
          <div className="text-2xl tracking-widest">{location}</div>
          <div className="text-sm">UTC {format(new Date(currentTimestamp), 'H:mm')}</div>
        </div>
        {/* Formatted Date Display */}
        <div className="text-sm font-medium flex-1 text-right flex items-center justify-end space-x-3">
          <span>{timePart} HRS</span><span>{datePart}</span>
        </div>
      </header>
      <main className="flex-1 px-4 py-3">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
