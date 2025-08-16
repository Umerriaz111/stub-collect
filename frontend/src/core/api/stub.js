import axios from "axios";
import config from "../services/configService";

// Create axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:5001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
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
      window.location.href = "/login";
      return Promise.reject({ message: "Please login to continue" });
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Stub data upload function - Simplified version
export const uploadStub = async (formData) => {
  return await api.post("/api/stubs/upload", formData);
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
