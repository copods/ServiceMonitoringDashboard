import CircularBarChart from "components/charts/circular-bar/CircularBarChart";
import DashboardErrorState from "components/common/DashboardErrorState";
import { useDashboardData } from "hooks/useDashboardData";
import { RootState } from "store";
import { useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { Icon } from "components/common/Icon";

const CircularBarChartPage: React.FC = () => {
  const { error: dataError, refetchData } = useDashboardData();
  const services = useSelector((state: RootState) => state.services.items);
  const domains = useSelector((state: RootState) => state.domains);
  const domain = domains[0]; // Assuming you want to display the first domain
  const [containerSize, setContainerSize] = useState({
    width: 600,
    height: 400,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const service = services[0]; // Assuming you want to display the first service

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setContainerSize({
          width: clientWidth * 0.7,
          height: clientHeight * 0.7,
        });
      }
    };

    updateSize();

    window.addEventListener("resize", updateSize);
  }, [containerRef]);

  if (dataError || services.length === 0) {
    return (
      <DashboardErrorState
        error={dataError || "No services available"}
        onRetry={refetchData}
      />
    );
  }

  console.log("containerSize", containerSize.height, containerSize.width);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center w-full h-full p-4 bg-[#232429]"
    >
      <div className="flex justify-between items-start ">
        <div>
          <h3 className="text-l font-medium text-white mb-1 drop-shadow-sm">
            {service.name}
          </h3>
        </div>

        <div className="text-right">
          <Icon domain={domain} border={false} />
        </div>
      </div>

      {/* Chart container with padding to create space */}
      {/* <div className="flex justify-center pl-2 pt-5"> */}
      <CircularBarChart
        hourlyData={service.hourlyData}
        width={containerSize.width}
        height={containerSize.height}
      />
      {/* </div> */}
    </div>
  );
};
export default CircularBarChartPage;
