import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from 'store';
import socketService from 'services/socket/socketService';
import Dashboard from 'pages/Dashboard';
import MOSDashboard from 'pages/MOSDashboard'; // Import the new page

const App: React.FC = () => {
  useEffect(() => {
    const cleanup = socketService.initialize(store.dispatch);
    
    return cleanup;
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mos" element={<MOSDashboard />} /> {/* Add the new route */}
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
