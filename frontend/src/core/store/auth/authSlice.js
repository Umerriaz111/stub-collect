import { createSlice } from "@reduxjs/toolkit";

import {
  destroyToken,
  getToken,
  getUser,
  saveUser,
  saveRefreshToken,
  destroyRefreshToken,
} from "../../services/authService";

const token = getToken();

const initialState = {
  user: getUser(),
  isAuthenticated: token ? true : false,
  tokenExpired: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    LOGIN: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload?.data?.username;
      saveUser(action.payload?.data?.username);
      //   ApiService.setAuthToken(action.payload?.accessToken);
      //   saveToken(action.payload?.accessToken);

      // If not a valid SJComputers user, set printing preference
    },
    LOGOUT: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.isUserSJComputers = false;
      state.printByNativeApp = false;
      saveUser(null);
      ApiService.setHeader("Authorization", "");
      destroyToken();
      destroyRefreshToken();
    },
    REGISTER: (state, action) => {
      state.isLoading = false;
      state.apiError = null;
      state.user = action.payload;
    },
    SET_TOKEN_EXPIRED: (state, action) => {
      state.tokenExpired = action.payload;
    },
  },
});
export const { LOGIN, LOGOUT, REGISTER, SET_TOKEN_EXPIRED } = authSlice.actions;
export default authSlice.reducer;
