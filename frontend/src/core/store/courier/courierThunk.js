import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCourierApi,
  addCourierPreferenceApi,
  removeCourierPreferenceApi,
} from '../../api/carrier';
import { AxiosError } from 'axios';

export const getCourier = createAsyncThunk('courier/getCourier', async (_, thunkAPI) => {
  try {
    const response = await getCourierApi();

    return thunkAPI.fulfillWithValue({
      courierList: response.data?.list,
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      const {
        data: { error },
      } = error;
      return thunkAPI.rejectWithValue(error?.message || '');
    }
  }
});

export const addCourierPreference = createAsyncThunk(
  'courier/addCourierPreference',
  async (data, thunkAPI) => {
    try {
      const response = await addCourierPreferenceApi(data);
      const selectedCourier = [...thunkAPI.getState().courier.selectedCourier];
      selectedCourier?.push?.(response.data);
      return thunkAPI.fulfillWithValue({ selectedCourier });
    } catch (error) {
      if (error instanceof AxiosError) {
        const {
          data: { error },
        } = error;
        return thunkAPI.rejectWithValue(error?.message || '');
      }
    }
  }
);

export const removeCourierPreference = createAsyncThunk(
  'courier/removeCourierPreference',
  async (data, thunkAPI) => {
    try {
      const response = await removeCourierPreferenceApi(data);
      const courierId = response.data?.id;
      const _selectedCouriers = [...thunkAPI.getState().courier.selectedCourier];
      const selectedCourier = _selectedCouriers?.filter(c => c.id !== courierId);
      return thunkAPI.fulfillWithValue({ selectedCourier });
    } catch (error) {
      if (error instanceof AxiosError) {
        const {
          data: { error },
        } = error;
        return thunkAPI.rejectWithValue(error?.message || '');
      }
    }
  }
);
