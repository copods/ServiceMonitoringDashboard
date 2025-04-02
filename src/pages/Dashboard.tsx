import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'store';
import { fetchDomains, fetchServices } from 'services/api';
import { setDomains } from 'store/slices/domainsSlice';
import { 
  fetchServicesStart,
  fetchServicesSuccess,
  fetchServicesFailure
} from 'store/slices/servicesSlice';
import { updateTimestamp } from 'store/slices/uiSlice';

import DashboardLayout from 'components/layout/DashboardLayout';
import DomainOverview from 'components/domain-section/DomainOverview';
import PolarChart from 'components/charts/polar-chart/PolarChart';
import TopServicesGrid from 'components/service-cards/TopServicesGrid';
import ServiceList from 'components/service-cards/ServiceList';
import ServiceDetailsModal from 'components/modals/ServiceDetailsModal';
import { Service } from 'types/service';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const domains = useSelector((state: RootState) => state.domains);
  const { items: services, loading, error, topCritical } = useSelector((state: RootState) => state.services);
  
  // State for selected service modal
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Update timestamp every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(updateTimestamp());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [dispatch]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch domains
        const domainsData = await fetchDomains();
        dispatch(setDomains(domainsData));
        
        // Fetch services
        dispatch(fetchServicesStart());
        const servicesData = await fetchServices();
        dispatch(fetchServicesSuccess(servicesData));
        
      } catch (err) {
        dispatch(fetchServicesFailure((err as Error).message));
      }
    };
    
    loadData();
    
    // Set up refresh interval
    const refreshInterval = setInterval(() => {
      loadData();
    }, 120000); // Refresh every 2 minutes
    
    return () => clearInterval(refreshInterval);
  }, [dispatch]);
  
  // Handle service selection
  const handleServiceSelect = useCallback((serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);
    }
  }, [services]);
  
  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setSelectedService(null);
  }, []);
  
  if (loading && services.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-xl">Loading dashboard data...</div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error && services.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-red-500">Error loading data: {error}</div>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }
  
  // Calculate non-top services (for the scrollable section)
  const otherServices = services.filter(
    service => !topCritical.includes(service.id)
  );
  
  return (
    <DashboardLayout>
      {/* Domain Overview Section */}
      <DomainOverview />
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left Side - Polar Chart */}
        <div className="lg:col-span-5">
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">Service Status Overview</h2>
            <PolarChart 
              services={services}
              domains={domains}
              width={600}
              height={600}
              onServiceSelect={handleServiceSelect}
            />
          </div>
        </div>
        
        {/* Right Side - Service Cards */}
        <div className="lg:col-span-7">
          <h2 className="text-xl font-semibold mb-4">Top Critical Services</h2>
          <TopServicesGrid onServiceSelect={handleServiceSelect} />
        </div>
      </div>
      
      {/* Scrollable Service List */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">All Other Services</h2>
        <ServiceList 
          services={otherServices} 
          domains={domains}
          onServiceSelect={handleServiceSelect}
        />
      </div>
      
      {/* Service Details Modal */}
      {selectedService && (
        <ServiceDetailsModal 
          service={selectedService}
          domain={domains.find(d => d.id === selectedService.domainId)}
          onClose={handleCloseModal}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
