import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { MosDashboardData, RouteDetails, Location } from '../../types/mos';
import { fetchCompleteMOSDashboardData, fetchRouteDetails } from '../../services/api/mosApi';

// Async Thunks
export const fetchInitialMOSData = createAsyncThunk<
  MosDashboardData, // Return type on success
  string | undefined, // Argument type (optional initial routeId)
  { rejectValue: string } // Type for rejected action payload
>('mos/fetchInitialData', async (initialRouteId, { rejectWithValue }) => {
  try {
    const data = await fetchCompleteMOSDashboardData();
    if (initialRouteId && data) {
      try {
        // Fetch initial route details if an ID is provided
        const routeDetails = await fetchRouteDetails(initialRouteId);
        data.selectedRoute = routeDetails;
      } catch (routeError) {
        console.warn(`Failed to fetch initial route details for ${initialRouteId}:`, routeError);
        data.selectedRoute = null; // Ensure it's null if fetch fails
      }
    } else if (data) {
      data.selectedRoute = null; // Ensure selectedRoute is null if no initial ID
    }
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


interface MOSState {
  data: MosDashboardData | null;
  locationsMap: Record<string, Location>; // Add locationsMap
  isLoading: boolean; // For initial data load
  isRouteLoading: boolean; // For specific route detail loading
  error: string | null;
  selectedRouteId: string | null; // Keep track of the selected ID
}

const initialState: MOSState = {
  data: null,
  locationsMap: {},
  isLoading: false,
  isRouteLoading: false,
  error: null,
  selectedRouteId: "denver-pune", // Set initial default route ID here
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
    }
    // Removed manual fetch status reducers, handled by extraReducers
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
        // If initial fetch included route details, update loading state
        if (action.payload.selectedRoute) {
          state.isRouteLoading = false;
        }
        // Set selectedRouteId based on initial fetch if it wasn't set or fetched successfully
        if (!state.selectedRouteId && action.payload.selectedRoute) {
           state.selectedRouteId = action.payload.selectedRoute.id; // Assuming RouteDetails has an id
        } else if (!action.payload.selectedRoute) {
           // If initial fetch didn't get route details (e.g., no initial ID provided or fetch failed)
           // Ensure selectedRouteId reflects this if it was previously set
           // state.selectedRouteId = null; // Or keep the default? Let's keep default for now.
        }

      })
      .addCase(fetchInitialMOSData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch initial data';
        state.data = null;
        state.locationsMap = {};
      })
      // Route Details Fetching
      .addCase(fetchRouteDetailsById.pending, (state, action) => {
        // We set isRouteLoading in the setSelectedRouteIdAction reducer
        // state.isRouteLoading = true;
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
        // Optionally clear selectedRoute or revert ID if needed
        // state.selectedRouteId = null; // Or revert to previous? Depends on desired UX
        if (state.data) {
          state.data.selectedRoute = null; // Clear potentially stale route data
        }
      });
  },
});

export const { setSelectedRouteIdAction, _updateLocationsMap } = mosSlice.actions;

// Selectors
export const selectMOSData = (state: RootState) => state.mos.data;
export const selectMOSLocationsMap = (state: RootState) => state.mos.locationsMap;
export const selectMOSIsLoading = (state: RootState) => state.mos.isLoading;
export const selectMOSIsRouteLoading = (state: RootState) => state.mos.isRouteLoading;
export const selectMOSError = (state: RootState) => state.mos.error;
export const selectSelectedRouteId = (state: RootState) => state.mos.selectedRouteId;

export default mosSlice.reducer;
