import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "store";
import MonitoringDashboard from "pages/MonitoringDashboard";
import MOSDashboard from "pages/MOSDashboard";
import { useDashboardData } from "./../hooks/useDashboardData";
import DashboardErrorState from "./../components/common/DashboardErrorState";
import PolarChartPage from "./../pages/PolarChartPage";
import CircularBarChartPage from "./../pages/CircularBarChartPage";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MonitoringDashboard />} />
      <Route path="/mos" element={<MOSDashboard />} />
      <Route path="/polar-chart" element={<PolarChartPage />} />
      <Route path="/circular-bar-chart" element={<CircularBarChartPage />} />
    </Routes>
  );
};

export default AppRoutes;
