import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  timeRange: {
    start: string;
    end: string;
  };
  location: string;
  currentTimestamp: string;
  loading: boolean;
  error: string | null;
  filters: {
    domain?: string;
    status?: 'normal' | 'warning' | 'critical';
    minCriticality?: number;
  };
}

const initialState: UiState = {
  timeRange: {
    start: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    end: new Date().toISOString(),
  },
  location: 'CALIFORNIA',
  currentTimestamp: new Date().toISOString(),
  loading: false,
  error: null,
  filters: {}
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTimeRange: (state, action: PayloadAction<{start: string; end: string}>) => {
      state.timeRange = action.payload;
    },
    setLocation: (state, action: PayloadAction<string>) => {
      state.location = action.payload;
    },
    updateTimestamp: (state) => {
      state.currentTimestamp = new Date().toISOString();
    },
    setFilter: (state, action: PayloadAction<{
      key: 'domain' | 'status' | 'minCriticality',
      value: string | number | undefined
    }>) => {
      const { key, value } = action.payload;
      if (value === undefined) {
        delete state.filters[key];
      } else {
        state.filters[key] = value as any;
      }
    },
    clearFilters: (state) => {
      state.filters = {};
    }
  }
});

export const {
  setTimeRange,
  setLocation,
  updateTimestamp,
  setFilter,
  clearFilters
} = uiSlice.actions;

export default uiSlice.reducer;
