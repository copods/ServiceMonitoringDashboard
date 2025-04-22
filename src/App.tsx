import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "store";
import mockSocketService from "services/mock-data/mockSocketService";
import AppRoutes from "./routes/index";

const App: React.FC = () => {
  useEffect(() => {
    const cleanup = mockSocketService.initialize(store.dispatch);
    return cleanup;
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <AppRoutes />
      </Router>
    </Provider>
  );
};

export default App;
