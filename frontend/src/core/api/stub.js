import axios from "axios";
import config from "../services/configService";

// Create axios instance with default config
const api = axios.create({
  baseURL: config.VITE_APP_API_BASE_URL || "http://localhost:5000",
  withCredentials: true, // Important for sending cookies
});

// Request interceptor to handle content type for FormData
api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = "/login";
      return Promise.reject({ message: "Please login to continue" });
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Stub data upload function
export const uploadStub = (formData) => {
  return api.post("/api/stubs/upload", formData);
};

// Get user's stubs
export const getUserStubs = () => {
  return api.get("/api/stubs");
};

// Get specific stub
export const getStub = (stubId) => {
  return api.get(`/api/stubs/${stubId}`);
};

// Update stub
export const updateStub = (stubId, data) => {
  return api.put(`/api/stubs/${stubId}`, data);
};
