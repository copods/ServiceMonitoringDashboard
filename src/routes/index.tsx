import React from "react";
import { Routes, Route } from "react-router-dom";
import MonitoringDashboard from "pages/MonitoringDashboard";
import MOSDashboard from "pages/MOSDashboard";
import PolarChartPage from "./../pages/PolarChartPage";
import CircularBarChartPage from "./../pages/CircularBarChartPage";
import NetworkGraphPage from "./../pages/NetworkGraphPage";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MonitoringDashboard />} />
      <Route path="/mos" element={<MOSDashboard />} />
      <Route path="/polar-chart" element={<PolarChartPage />} />
      <Route path="/circular-bar-chart" element={<CircularBarChartPage />} />
      <Route path="/sankey-chart" element={<NetworkGraphPage />} />
    </Routes>
  );
};

export default AppRoutes;
