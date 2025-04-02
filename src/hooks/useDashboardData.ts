import { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'store';
import { fetchDomains, fetchServices } from 'services/api';
import { setDomains } from 'store/slices/domainsSlice';
import {
  fetchServicesStart,
  fetchServicesSuccess,
  fetchServicesFailure,
} from 'store/slices/servicesSlice';

const DATA_REFRESH_INTERVAL = 120000; // 2 minutes

export const useDashboardData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    dispatch(fetchServicesStart()); // Indicate loading in Redux state as well
    try {
      const [domainsData, servicesData] = await Promise.all([
        fetchDomains(),
        fetchServices(),
      ]);

      dispatch(setDomains(domainsData));
      dispatch(fetchServicesSuccess(servicesData));
      setError(null); // Clear error on success
    } catch (err) {
      const errorMessage = (err as Error).message;
      dispatch(fetchServicesFailure(errorMessage));
      setError(errorMessage); // Set local error state
    } finally {
      setIsLoading(false); // Set local loading state
    }
  }, [dispatch]);

  useEffect(() => {
    loadData(); // Initial load

    const refreshInterval = setInterval(() => {
      loadData();
    }, DATA_REFRESH_INTERVAL);

    return () => clearInterval(refreshInterval);
  }, [loadData]);

  // Expose loading state, error, and the refetch function
  return { isLoading, error, refetchData: loadData };
};
