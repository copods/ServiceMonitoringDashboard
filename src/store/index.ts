import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import domainsReducer from './slices/domainsSlice';
import servicesReducer from './slices/servicesSlice';
import uiReducer from './slices/uiSlice';
import mosReducer from './slices/mosSlice'; // Import the new MOS reducer

export const store = configureStore({
  reducer: {
    domains: domainsReducer,
    services: servicesReducer,
    ui: uiReducer,
    mos: mosReducer // Add the MOS reducer here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
