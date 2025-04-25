import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "store";
import { updateTimestamp } from "store/slices/uiSlice";
import { useDashboardData } from "hooks/useDashboardData";
import { Service } from "types/service";

import DashboardErrorState from "components/common/DashboardErrorState";
import MonitoringDashboardLayout from "components/layout/MonitoringDashboardLayout";
// import MOSDashboard from "./MOSDashboard";

const DomainOverview = lazy(
  () => import("components/domain-section/DomainOverview")
);
const PolarChart = lazy(
  () => import("components/charts/polar-chart/PolarChart")
);
const TopServicesGrid = lazy(
  () => import("components/service-cards/TopServicesGrid")
);
const ServiceList = lazy(() => import("components/service-cards/ServiceList"));
const ServiceDetailsModal = lazy(
  () => import("components/modals/ServiceDetailsModal")
);

const TIMESTAMP_UPDATE_INTERVAL = 60000;

const LoadingFallback: React.FC = () => (
  <div className="p-4 text-center">Loading...</div>
);

const MonitoringDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const domains = useSelector((state: RootState) => state.domains);
  const { items: services, topCritical } = useSelector(
    (state: RootState) => state.services
  );
  const { error: dataError, refetchData } = useDashboardData();
  // Inside your component
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(updateTimestamp());
    }, TIMESTAMP_UPDATE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  useEffect(() => {
    if (selectedService) {
      navigate("/mos");
    }
  }, [selectedService, navigate]);

  const handleServiceSelect = useCallback(
    (serviceId: string) => {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        setSelectedService(service);
      }
    },
    [services]
  );

  const handleCloseModal = useCallback(() => {
    setSelectedService(null);
  }, []);

  const otherServices = useMemo(() => {
    return services.filter((service) => !topCritical.includes(service.id));
  }, [services, topCritical]);

  if (dataError && services.length === 0) {
    return <DashboardErrorState error={dataError} onRetry={refetchData} />;
  }

  return (
    <MonitoringDashboardLayout>
      {/* Domain Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 mb-1">
        {domains.map((domain) => (
          <Suspense key={domain.id}>
            <DomainOverview domain={domain} />
          </Suspense>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-1">
        {/* Left Side - Polar Chart */}
        <div className="lg:col-span-5">
          <div className="bg-[#232429]">
            <Suspense>
              <PolarChart
                services={services}
                domains={domains}
                width={580}
                height={580}
                onServiceSelect={handleServiceSelect}
              />
            </Suspense>
          </div>
        </div>

        {/* Right Side - Service Cards */}
        <div className="lg:col-span-7">
          <Suspense>
            <TopServicesGrid onServiceSelect={handleServiceSelect} />
          </Suspense>
        </div>
      </div>

      {/* Scrollable Service List */}
      <div>
        <Suspense>
          <ServiceList
            services={otherServices}
            domains={domains}
            onServiceSelect={handleServiceSelect}
          />
        </Suspense>
      </div>
    </MonitoringDashboardLayout>
  );
};

export default MonitoringDashboard;
