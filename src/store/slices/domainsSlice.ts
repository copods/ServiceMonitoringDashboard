import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Domain } from 'types/domain';

const initialState: Domain[] = [];

export const domainsSlice = createSlice({
  name: 'domains',
  initialState,
  reducers: {
    setDomains: (state, action: PayloadAction<Domain[]>) => {
      return action.payload;
    }
  }
});

export const { setDomains } = domainsSlice.actions;
export default domainsSlice.reducer;
