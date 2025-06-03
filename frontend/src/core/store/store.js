import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import appSlice from './App/appSlice';
import courierReducer from './courier/courierSlice';

const rootReducer = {
  auth: authReducer,
  app: appSlice,
  courier: courierReducer,
};

const store = configureStore({
  reducer: rootReducer,
});

export { store };
