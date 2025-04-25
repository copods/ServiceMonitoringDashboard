import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { MosDashboardData, RouteDetails, Location, HistoricalData } from '../../types/mos';
import { fetchCompleteMOSDashboardData, fetchRouteDetails, fetchHistoricalData } from '../../services/api/mosApi';

// Define the argument type for the thunk
interface FetchInitialMOSDataArgs {
  serviceName: string;
  sourceId: string;
  routeId?: string;
}

// Async Thunks
export const fetchInitialMOSData = createAsyncThunk<
  MosDashboardData, // Return type on success
  FetchInitialMOSDataArgs, // Argument type (sourceId and optional routeId)
  { rejectValue: string } // Type for rejected action payload
>('mos/fetchInitialData', async ({ sourceId,serviceName, routeId }, { rejectWithValue }) => {
  try {
    // Pass sourceId and optional routeId to the API call
    const data = await fetchCompleteMOSDashboardData(sourceId,serviceName, routeId);
    if (!data) {
      throw new Error('No data received from API');
    }
    return data;
  } catch (err: any) {
    console.error("Error fetching initial MOS dashboard data:", err);
    return rejectWithValue(err.message || 'Failed to fetch initial MOS dashboard data.');
  }
});

export const fetchRouteDetailsById = createAsyncThunk<
  RouteDetails, // Return type on success
  string, // Argument type (routeId)
  { rejectValue: string } // Type for rejected action payload
>('mos/fetchRouteDetails', async (routeId, { rejectWithValue }) => {
  try {
    const routeDetails = await fetchRouteDetails(routeId);
    if (!routeDetails) {
      throw new Error('No route details received from API');
    }
    return routeDetails;
  } catch (err: any) {
    console.error(`Error fetching details for route ${routeId}:`, err);
    return rejectWithValue(err.message || `Failed to fetch details for route ${routeId}.`);
  }
});

// New thunk for fetching route-specific historical data
export const fetchHistoricalDataForRoute = createAsyncThunk<
  { routeId: string, historicalData: HistoricalData[] }, // Return type: object with routeId and data
  { routeId: string, sourceId: string }, // Args type: routeId and sourceId
  { rejectValue: string }
>('mos/fetchHistoricalData', async ({ routeId, sourceId }, { rejectWithValue }) => {
  try {
    const data = await fetchHistoricalData(routeId, sourceId);
    return { routeId, historicalData: data };
  } catch (err: any) {
    console.error(`Error fetching historical data for route ${routeId}:`, err);
    return rejectWithValue(err.message || `Failed to fetch historical data for route ${routeId}.`);
  }
});

interface MOSState {
  data: MosDashboardData | null;
  locationsMap: Record<string, Location>;
  routeHistoricalData: Record<string, HistoricalData[]>; // Add this line
  isLoading: boolean;
  isRouteLoading: boolean;
  isHistoricalDataLoading: boolean; // Add this line
  error: string | null;
  selectedRouteId: string | null;
  selectedSourceId: string;
}

const initialState: MOSState = {
  data: null,
  locationsMap: {},
  routeHistoricalData: {}, // Add this line
  isLoading: false,
  isRouteLoading: false,
  isHistoricalDataLoading: false, // Add this line
  error: null,
  selectedRouteId: "denver-pune",
  selectedSourceId: "denver",
};

const mosSlice = createSlice({
  name: 'mos',
  initialState,
  reducers: {
    // Action to explicitly set the selected route ID, potentially triggering fetch via component logic
    setSelectedRouteIdAction(state, action: PayloadAction<string | null>) {
       if (state.selectedRouteId !== action.payload) {
         state.selectedRouteId = action.payload;
         // Reset route details when ID changes, let thunk handle fetching
         if (state.data) {
            state.data.selectedRoute = null;
         }
         state.isRouteLoading = true; // Indicate loading starts
         state.error = null; // Clear previous route errors
       }
    },
    // Reducer to update locationsMap internally when data changes
    _updateLocationsMap(state) {
      if (state.data?.locations) {
        const map: Record<string, Location> = {};
        state.data.locations.forEach((location) => {
          map[location.id] = location;
        });
        state.locationsMap = map;
      } else {
        state.locationsMap = {};
      }
    },
    // New reducer for changing source location
    setSelectedSourceLocation(state, action: PayloadAction<string>) {
      state.selectedSourceId = action.payload;
      // Reset selected route when source changes
      state.selectedRouteId = null;
      if (state.data) {
        state.data.selectedRoute = null;
      }
      // Reset historical data when changing source
      state.routeHistoricalData = {};
      if (state.data) {
        state.data.historicalData = [];
      }
      state.error = null; // Clear previous errors
    },
    // Reset historical data when source changes
    resetHistoricalData(state) {
      state.routeHistoricalData = {};
      if (state.data) {
        state.data.historicalData = [];
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Initial Data Fetching
      .addCase(fetchInitialMOSData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInitialMOSData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;

        // Update locations map after successful fetch
        const map: Record<string, Location> = {};
        action.payload.locations.forEach((location) => {
          map[location.id] = location;
        });
        state.locationsMap = map;

        // Initialize or update route-specific historical data if present in the response
        if (action.payload.routeHistoricalData) {
          state.routeHistoricalData = {
            ...state.routeHistoricalData,
            ...action.payload.routeHistoricalData
          };
        }

        // If initial fetch included route details, update loading state
        if (action.payload.selectedRoute) {
          state.isRouteLoading = false;
        }

        // Set selectedRouteId based on initial fetch if it wasn't set or fetched successfully
        if (!state.selectedRouteId && action.payload.selectedRoute) {
           state.selectedRouteId = action.payload.selectedRoute.id;
        }
      })
      .addCase(fetchInitialMOSData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch initial data';
        state.data = null;
        state.locationsMap = {};
        state.routeHistoricalData = {};
      })

      // Route Details Fetching
      .addCase(fetchRouteDetailsById.pending, (state, action) => {
        state.isRouteLoading = true;
        // Set selectedRouteId when fetch starts based on the argument
        state.selectedRouteId = action.meta.arg;
        state.error = null; // Clear previous errors specifically for route loading
      })
      .addCase(fetchRouteDetailsById.fulfilled, (state, action) => {
        state.isRouteLoading = false;
        if (state.data) {
          state.data.selectedRoute = action.payload;
        }
        // Ensure selectedRouteId matches the fetched route
        state.selectedRouteId = action.payload.id;
      })
      .addCase(fetchRouteDetailsById.rejected, (state, action) => {
        state.isRouteLoading = false;
        // Keep existing data, but show an error
        state.error = action.payload ?? 'Failed to fetch route details';
        if (state.data) {
          state.data.selectedRoute = null; // Clear potentially stale route data
        }
      })

      // Historical Data Fetching
      .addCase(fetchHistoricalDataForRoute.pending, (state) => {
        state.isHistoricalDataLoading = true;
        state.error = null; // Clear previous errors specifically for historical data loading
      })
      .addCase(fetchHistoricalDataForRoute.fulfilled, (state, action) => {
        state.isHistoricalDataLoading = false;

        // Store the historical data in the map with routeId as key
        state.routeHistoricalData[action.payload.routeId] = action.payload.historicalData;

        // Also update the backward-compatible historicalData if the route is selected
        if (state.selectedRouteId === action.payload.routeId && state.data) {
          state.data.historicalData = action.payload.historicalData;
        }

        // Update the routeHistoricalData map in the data object if it exists
        if (state.data) {
          if (!state.data.routeHistoricalData) state.data.routeHistoricalData = {};
          state.data.routeHistoricalData[action.payload.routeId] = action.payload.historicalData;
        }
      })
      .addCase(fetchHistoricalDataForRoute.rejected, (state, action) => {
        state.isHistoricalDataLoading = false;
        // Only set error if there's no existing route data
        if (!state.routeHistoricalData[action.meta.arg.routeId]) {
          state.error = action.payload ?? 'Failed to fetch historical data';
        }
      });
  },
});

// Export the new actions
export const {
  setSelectedRouteIdAction,
  _updateLocationsMap,
  setSelectedSourceLocation,
  resetHistoricalData
} = mosSlice.actions;

// Selectors
export const selectMOSData = (state: RootState) => state.mos.data;
export const selectMOSLocationsMap = (state: RootState) => state.mos.locationsMap;
export const selectMOSIsLoading = (state: RootState) => state.mos.isLoading;
export const selectMOSIsRouteLoading = (state: RootState) => state.mos.isRouteLoading;
export const selectIsHistoricalDataLoading = (state: RootState) => state.mos.isHistoricalDataLoading;
export const selectMOSError = (state: RootState) => state.mos.error;
export const selectSelectedRouteId = (state: RootState) => state.mos.selectedRouteId;
export const selectSelectedSourceId = (state: RootState) => state.mos.selectedSourceId;

// Add a new selector for route-specific historical data
export const selectHistoricalDataForRoute = (routeId: string | null) => (state: RootState) => {
  if (!routeId) return [];
  return state.mos.routeHistoricalData[routeId] || [];
};

export default mosSlice.reducer;
