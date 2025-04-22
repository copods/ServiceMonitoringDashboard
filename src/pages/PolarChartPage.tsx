import PolarChart from "components/charts/polar-chart/PolarChart";
import DashboardErrorState from "components/common/DashboardErrorState";
import { RootState } from "store";
import { useSelector } from "react-redux";
import { useDashboardData } from "hooks/useDashboardData";
import { useEffect, useRef, useState } from "react";

const PolarChartPage: React.FC = () => {
  const { error: dataError, refetchData } = useDashboardData();

  const services = useSelector((state: RootState) => state.services.items);
  const domains = useSelector((state: RootState) => state.domains);
  const [containerSize, setContainerSize] = useState({
    width: 700,
    height: 500,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setContainerSize({
          width: clientWidth * 0.8,
          height: clientHeight * 0.8,
        });
      }
    };

    updateSize();

    window.addEventListener("resize", updateSize);
  }, [containerRef]);

  if (dataError && services.length === 0) {
    return <DashboardErrorState error={dataError} onRetry={refetchData} />;
  }
  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center w-full h-full p-4 bg-[#232429]"
    >
      <PolarChart
        services={services}
        domains={domains}
        width={containerSize.width}
        height={containerSize.height}
      />
    </div>
  );
};
export default PolarChartPage;
