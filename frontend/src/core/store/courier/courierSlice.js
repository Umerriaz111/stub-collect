import { createSlice } from '@reduxjs/toolkit';
import { addCourierPreference, getCourier, removeCourierPreference } from './courierThunk';

const initialState = {
  loading: false,
  courierList: [],
  selectedCourier: [],
  // toggle courierList
  toggleCourierList: false,
  error: '',
};

const courierSlice = createSlice({
  name: 'courier',
  initialState,
  reducers: {
    setWebStoreCourierPref: (state, { payload }) => {
      state.selectedCourier = payload.selectedCourier || [];

      if (payload.selectedCourier && payload.selectedCourier.length)
        state.toggleCourierList = false;
      else state.toggleCourierList = true;
    },
    toggleCourierList: state => {
      state.toggleCourierList = !state.toggleCourierList;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getCourier.pending, state => {
        state.loading = true;
      })
      .addCase(getCourier.fulfilled, (state, action) => {
        state.loading = false;
        state.courierList = action.payload.courierList;
      })
      .addCase(getCourier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addCourierPreference.fulfilled, (state, action) => {
        state.selectedCourier = action.payload.selectedCourier;
      })
      .addCase(removeCourierPreference.fulfilled, (state, action) => {
        state.selectedCourier = action.payload.selectedCourier;
      });
  },
});

export const { setWebStoreCourierPref, toggleCourierList } = courierSlice.actions;

export default courierSlice.reducer;
