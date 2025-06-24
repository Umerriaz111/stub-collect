import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import appSlice from "./App/appSlice";

const rootReducer = {
  auth: authReducer,
  app: appSlice,
};

const store = configureStore({
  reducer: rootReducer,
});

export { store };
