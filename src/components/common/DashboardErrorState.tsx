import React from 'react';
import DashboardLayout from 'components/layout/DashboardLayout';

interface DashboardErrorStateProps {
  error: string;
  onRetry: () => void;
}

const DashboardErrorState: React.FC<DashboardErrorStateProps> = ({ error, onRetry }) => {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-xl text-red-500 mb-4">Error loading data: {error}</div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={onRetry}
        >
          Retry
        </button>
      </div>
    </DashboardLayout>
  );
};

export default DashboardErrorState;
