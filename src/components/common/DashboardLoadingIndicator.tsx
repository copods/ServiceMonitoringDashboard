import React from 'react';
import DashboardLayout from 'components/layout/DashboardLayout';

const DashboardLoadingIndicator: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-full">
        <div className="text-xl">Loading dashboard data...</div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardLoadingIndicator;
