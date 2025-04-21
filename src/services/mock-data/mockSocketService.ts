import { AppDispatch } from 'store';
import { updateService, updateServiceImportance } from 'store/slices/servicesSlice';
import { Service, ServiceImportanceUpdate, ServiceUpdate } from 'types/service';
import monitorData from './monitor-data.json';

// Helper functions (mimicking the mock-server/websocket.js helpers)
const randomInt = (min: number, max: number): number => 
  Math.floor(Math.random() * (max - min + 1)) + min;

// Generate an importance update for eligible services
const generateImportanceUpdate = (services: Service[]): ServiceImportanceUpdate | null => {
  // Find eligible services (normal status, totalRequests < 500)
  const eligibleServices = services.filter(service => 
    service.status === 'normal' && service.totalRequests < 500
  );
  
  if (eligibleServices.length === 0) return null;
  
  // Randomly select a service
  const selectedService = eligibleServices[Math.floor(Math.random() * eligibleServices.length)];
  
  // Decide whether to increase or decrease importance (50/50 chance)
  const isIncreasing = Math.random() > 0.5;
  
  // Calculate new importance value (change by 20-30 points for significant movement)
  const changeAmount = Math.floor(Math.random() * 10) + 20;
  const previousImportance = selectedService.importance;
  const newImportance = isIncreasing 
    ? Math.min(100, previousImportance + changeAmount)
    : Math.max(5, previousImportance - changeAmount);
  
  // Don't update if we've reached limits
  if (newImportance === previousImportance) return null;
  
  // Update the local service data
  selectedService.importance = newImportance;
  
  return {
    id: selectedService.id,
    importance: newImportance,
    previousImportance,
    isIncreasing
  };
};

// Generate a regular service update
const generateServiceUpdate = (services: Service[]): ServiceUpdate => {
  // Generate a random service update
  const randomServiceIndex = randomInt(0, services.length - 1);
  const service = services[randomServiceIndex];
  
  // Update a random hourly data point
  const randomHour = randomInt(0, 23);
  
  // Make a deep copy to avoid mutating the original data
  const hourlyData = JSON.parse(JSON.stringify(service.hourlyData));
  
  // Get the service's importance
  const serviceImportance = service.importance;
  
  // Increase or decrease requests randomly
  const requestChange = randomInt(-50, 100);
  hourlyData[randomHour].totalRequests += requestChange;
  
  // Ensure totalRequests is not negative
  hourlyData[randomHour].totalRequests = Math.max(0, hourlyData[randomHour].totalRequests);
  
  // For high importance services (>75), cap totalRequests at 11,000
  if (serviceImportance > 75 && hourlyData[randomHour].totalRequests > 11000) {
    hourlyData[randomHour].totalRequests = randomInt(9000, 11000);
  }
  
  // Update failed requests proportionally
  const failedRequestsPercentage = service.criticalityPercentage / 100;
  hourlyData[randomHour].failedRequests = Math.floor(
    hourlyData[randomHour].totalRequests * failedRequestsPercentage
  );
  
  // For high importance services (>75), cap failedRequests at 11,000
  if (serviceImportance > 75 && hourlyData[randomHour].failedRequests > 11000) {
    hourlyData[randomHour].failedRequests = randomInt(9000, 11000);
  }
  
  // Create service update
  return {
    id: service.id,
    hourlyData: [hourlyData[randomHour]]
  };
};

class MockSocketService {
  private dispatch: AppDispatch | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private services: Service[] = [];
  private isRunning = false;

  initialize(dispatch: AppDispatch): () => void {
    console.log('MockSocketService: Initializing');
    this.dispatch = dispatch;
    this.services = JSON.parse(JSON.stringify(monitorData.services));
    
    // Only start if not already running
    if (!this.isRunning) {
      this.startMockUpdates();
    }
    
    // Return cleanup function
    return () => {
      console.log('MockSocketService: Cleanup function called');
      this.stopMockUpdates();
    };
  }

  private startMockUpdates(): void {
    console.log('MockSocketService: Starting mock updates');
    this.isRunning = true;
    
    // Clear any existing interval
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    // Send mock updates every 3 seconds (matching the original WebSocket behavior)
    this.updateInterval = setInterval(() => {
      if (!this.dispatch) return;
      
      // 25% chance to send an importance update instead of regular update
      if (Math.random() < 0.25) {
        const importanceUpdate = generateImportanceUpdate(this.services);
        
        if (importanceUpdate) {
          console.log('MockSocketService: Dispatching importance update', importanceUpdate);
          this.dispatch(updateServiceImportance(importanceUpdate));
        } else {
          // Fall back to regular update if no eligible services
          const serviceUpdate = generateServiceUpdate(this.services);
          console.log('MockSocketService: Dispatching service update', serviceUpdate);
          this.dispatch(updateService(serviceUpdate));
        }
      } else {
        const serviceUpdate = generateServiceUpdate(this.services);
        console.log('MockSocketService: Dispatching service update', serviceUpdate);
        this.dispatch(updateService(serviceUpdate));
      }
    }, 3000); // 3 seconds interval
  }

  private stopMockUpdates(): void {
    console.log('MockSocketService: Stopping mock updates');
    this.isRunning = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Dummy methods to maintain the same interface as the original socketService
  sendMessage(type: string, payload: any): void {
    console.log('MockSocketService: sendMessage called (no-op)', { type, payload });
  }
  
  isConnected(): boolean {
    return this.isRunning;
  }
}

const mockSocketService = new MockSocketService();
export default mockSocketService; 