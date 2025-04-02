import axios from 'axios';
import { Domain } from 'types/domain';
import { Service } from 'types/service';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchDomains = async (): Promise<Domain[]> => {
  const response = await api.get('/domains');
  return response.data;
};

export const fetchServices = async (): Promise<Service[]> => {
  const response = await api.get('/services');
  return response.data;
};

export const fetchServiceDetails = async (serviceId: string): Promise<Service> => {
  const response = await api.get(`/services/${serviceId}`);
  return response.data;
};

// Error handling interceptor
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
