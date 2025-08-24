import axios from "axios";
import config from "../services/configService";

// Create axios instance with default config
const api = axios.create({
  baseURL: config.VITE_APP_API_BASE_URL || "http://localhost:5000",
  withCredentials: true, // Important for sending cookies
});

export const registerUserApi = (registerData: any) => {
  return api.post("/auth/register", registerData);
};

export const loginApi = (loginData: any) => {
  return api.post("/auth/login", loginData);
};

export const logoutApi = () => {
  return api.post("/auth/logout");
};
