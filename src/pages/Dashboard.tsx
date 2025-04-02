import React, { useEffect, useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'store';
import { updateTimestamp } from 'store/slices/uiSlice';
import { useDashboardData } from 'hooks/useDashboardData';
import DashboardLoadingIndicator from 'components/common/DashboardLoadingIndicator';
import DashboardErrorState from 'components/common/DashboardErrorState';

import DashboardLayout from 'components/layout/DashboardLayout';

import { Service } from 'types/service';

const DomainOverview = lazy(() => import('components/domain-section/DomainOverview'));
const PolarChart = lazy(() => import('components/charts/polar-chart/PolarChart'));
const TopServicesGrid = lazy(() => import('components/service-cards/TopServicesGrid'));
const ServiceList = lazy(() => import('components/service-cards/ServiceList'));
const ServiceDetailsModal = lazy(() => import('components/modals/ServiceDetailsModal'));

const TIMESTAMP_UPDATE_INTERVAL = 60000;

const LoadingFallback: React.FC = () => <div className="p-4 text-center">Loading...</div>;

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const domains = useSelector((state: RootState) => state.domains);
  const { items: services, topCritical } = useSelector((state: RootState) => state.services);
  const { isLoading: isDataLoading, error: dataError, refetchData } = useDashboardData();

  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(updateTimestamp());
    }, TIMESTAMP_UPDATE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  const handleServiceSelect = useCallback((serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);
    }
  }, [services]);

  const handleCloseModal = useCallback(() => {
    setSelectedService(null);
  }, []);

  const otherServices = useMemo(() => {
    return services.filter(service => !topCritical.includes(service.id));
  }, [services, topCritical]);

  if (isDataLoading && services.length === 0) {
    return <DashboardLoadingIndicator />;
  }

  if (dataError && services.length === 0) {
    return <DashboardErrorState error={dataError} onRetry={refetchData} />;
  }

  return (
    <DashboardLayout>
      {/* Domain Overview Section */}
      <Suspense fallback={<LoadingFallback />}>
        <DomainOverview />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left Side - Polar Chart */}
        <div className="lg:col-span-5">
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">Service Status Overview</h2>
            <Suspense fallback={<LoadingFallback />}>
              <PolarChart
                services={services}
                domains={domains}
                width={600}
                height={600}
                onServiceSelect={handleServiceSelect}
              />
            </Suspense>
          </div>
        </div>

        {/* Right Side - Service Cards */}
        <div className="lg:col-span-7">
          <h2 className="text-xl font-semibold mb-4">Top Critical Services</h2>
          <Suspense fallback={<LoadingFallback />}>
            <TopServicesGrid onServiceSelect={handleServiceSelect} />
          </Suspense>
        </div>
      </div>

      {/* Scrollable Service List */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">All Other Services</h2>
        <Suspense fallback={<LoadingFallback />}>
          <ServiceList
            services={otherServices}
            domains={domains}
            onServiceSelect={handleServiceSelect}
          />
        </Suspense>
      </div>

      {selectedService && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"><LoadingFallback /></div>}>
          <ServiceDetailsModal
            service={selectedService}
            domain={domains.find(d => d.id === selectedService.domainId)}
            onClose={handleCloseModal}
          />
        </Suspense>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
