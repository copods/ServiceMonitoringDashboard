import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Service, ServiceUpdate } from '@/types/service';

interface ServicesState {
  items: Service[];
  topCritical: string[];
  loading: boolean;
  error: string | null;
}

const initialState: ServicesState = {
  items: [],
  topCritical: [],
  loading: false,
  error: null
};

export const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    fetchServicesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchServicesSuccess: (state, action: PayloadAction<Service[]>) => {
      state.items = action.payload;
      state.loading = false;
      
      // Calculate top 6 critical services based on criticality percentage
      state.topCritical = action.payload
        .sort((a, b) => b.criticalityPercentage - a.criticalityPercentage)
        .slice(0, 6)
        .map(service => service.id);
    },
    fetchServicesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateService: (state, action: PayloadAction<ServiceUpdate>) => {
      const { id, ...updates } = action.payload;
      
      // Find the service to update
      const serviceIndex = state.items.findIndex(service => service.id === id);
      if (serviceIndex !== -1) {
        // Update the service with new data
        state.items[serviceIndex] = {
          ...state.items[serviceIndex],
          ...updates,
          // If hourlyData is updated, merge with existing data
          hourlyData: updates.hourlyData 
            ? [...state.items[serviceIndex].hourlyData.filter(
                existing => !updates.hourlyData?.some(
                  updated => updated.hour === existing.hour
                )
              ), 
              ...(updates.hourlyData || [])]
            : state.items[serviceIndex].hourlyData
        };
        
        // Recalculate top critical services
        state.topCritical = state.items
          .sort((a, b) => b.criticalityPercentage - a.criticalityPercentage)
          .slice(0, 6)
          .map(service => service.id);
      }
    }
  }
});

export const { 
  fetchServicesStart, 
  fetchServicesSuccess, 
  fetchServicesFailure,
  updateService 
} = servicesSlice.actions;

export default servicesSlice.reducer;
