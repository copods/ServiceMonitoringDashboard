import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import domainsReducer from './slices/domainsSlice';
import servicesReducer from './slices/servicesSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    domains: domainsReducer,
    services: servicesReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // Allow non-serializable values in state
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Create typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
