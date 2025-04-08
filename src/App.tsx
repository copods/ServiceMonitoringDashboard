import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from 'store';
import socketService from 'services/socket/socketService';
import MonitoringDashboard from 'pages/MonitoringDashboard';
import MOSDashboard from 'pages/MOSDashboard';

const App: React.FC = () => {
  useEffect(() => {
    const cleanup = socketService.initialize(store.dispatch);
    
    return cleanup;
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<MonitoringDashboard />} />
          <Route path="/mos" element={<MOSDashboard />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
