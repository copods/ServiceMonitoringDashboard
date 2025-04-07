// src/store/slices/networkSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Location, Route, BidirectionalRoute, MonthlyStatistic, ServiceDetails } from 'types/network';

interface NetworkState {
  locations: Location[];
  routes: Route[];
  selectedRoute: BidirectionalRoute | null;
  statistics: MonthlyStatistic[];
  serviceDetails: ServiceDetails;
  loading: boolean;
  error: string | null;
}

const initialState: NetworkState = {
  locations: [],
  routes: [],
  selectedRoute: null,
  statistics: [],
  serviceDetails: {
    name: 'Web Service 2',
    application: 'Audio',
    vlan: 'Unknown',
    codec: 'G.729'
  },
  loading: false,
  error: null
};

export const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    fetchNetworkDataStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchNetworkDataSuccess: (state, action: PayloadAction<{
      locations: Location[],
      routes: Route[],
      statistics: MonthlyStatistic[]
    }>) => {
      state.locations = action.payload.locations;
      state.routes = action.payload.routes;
      state.statistics = action.payload.statistics;
      state.loading = false;
    },
    fetchNetworkDataFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    selectRoute: (state, action: PayloadAction<string>) => {
      const sourceRouteId = action.payload;
      
      // Find the selected route
      const selectedRoute = state.routes.find(route => route.id === sourceRouteId);
      if (!selectedRoute) return;
      
      // Find the reverse route (if exists)
      const reverseRoute = state.routes.find(route => 
        route.sourceId === selectedRoute.destinationId && 
        route.destinationId === selectedRoute.sourceId
      ) || {
        id: '',
        sourceId: selectedRoute.destinationId,
        destinationId: selectedRoute.sourceId,
        totalStreams: 0,
        impactedPercentage: 0,
        mosScore: 0,
        packetLoss: 0,
        degradationPercentage: 0
      };
      
      state.selectedRoute = {
        forwardRoute: selectedRoute,
        reverseRoute: reverseRoute,
        overlapAnalysis: `${selectedRoute.impactedPercentage}% of streams reaching ${
          state.locations.find(l => l.id === selectedRoute.destinationId)?.name
        } are impacted. Out of all the streams that reach ${
          state.locations.find(l => l.id === selectedRoute.destinationId)?.name
        }, ${Math.round(selectedRoute.totalStreams / 1000)}% come from ${
          state.locations.find(l => l.id === selectedRoute.sourceId)?.name
        }. It is inconclusive to say that there is an overlap between the impacted streams and streams coming from ${
          state.locations.find(l => l.id === selectedRoute.sourceId)?.name
        }`
      };
    },
    updateTimeRange: (state, action: PayloadAction<{start: string, end: string}>) => {
      // This would trigger refetching of data in a real implementation
    }
  }
});

export const { 
  fetchNetworkDataStart, 
  fetchNetworkDataSuccess, 
  fetchNetworkDataFailure,
  selectRoute,
  updateTimeRange
} = networkSlice.actions;

export default networkSlice.reducer;
