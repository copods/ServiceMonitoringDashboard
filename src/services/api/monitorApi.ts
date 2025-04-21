// import axios from 'axios';
import { Domain } from 'types/domain';
import { Service } from 'types/service';
import { getMockDomains, getMockServices, getMockServiceDetails } from '../mock-data/mockDataService';

// Always use mock data regardless of environment
// const USE_MOCK_DATA = true;

// // Only kept for potential future use
// const API_URL = process.env.REACT_APP_API_URL || '';
// const api = null; // Not initializing axios since we're always using mock data

export const fetchDomains = async (): Promise<Domain[]> => {
  console.log('Using mock data for domains');
  return getMockDomains();
};

export const fetchServices = async (): Promise<Service[]> => {
  console.log('Using mock data for services');
  return getMockServices();
};

export const fetchServiceDetails = async (serviceId: string): Promise<Service> => {
  console.log(`Using mock data for service details: ${serviceId}`);
  return getMockServiceDetails(serviceId);
};