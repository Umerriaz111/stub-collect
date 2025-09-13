
// Request interceptor to handle content type for FormData

import { getApi } from "./apiService";

async function addInterceptors(api) {
  api.interceptors.request.use(
    (config) => {
      if (config.data instanceof FormData) {
        config.headers["Content-Type"] = "multipart/form-data";
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
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
}


// Stub data upload function - Simplified version

export const uploadStub = async (formData) => {
  const api = await getApi();
  await addInterceptors(api);
  return await api.post("/api/stubs/upload", formData);
};

// Get user's stubs
export const getUserStubs = async () => {
  const api = await getApi();
  await addInterceptors(api);
  return api.get("/api/stubs");
};

// Get specific stub
export const getStub = async (stubId) => {
  const api = await getApi();
  await addInterceptors(api);
  return api.get(`/api/stubs/${stubId}`);
};

// Update stub
export const updateStub = async (stubId, data) => {
  const api = await getApi();
  await addInterceptors(api);
  return api.put(`/api/stubs/${stubId}`, data);
};

// Delete stub
export const deleteStub = async (stubId) => {
  const api = await getApi();
  await addInterceptors(api);
  return api.delete(`/api/stubs/${stubId}`);
};

// Stub creation agent - for chatbot interaction
export const stubCreationAgent = async (formData) => {
  const api = await getApi();
  await addInterceptors(api);
  return await api.post("/api/stub-creation-agent", formData);
};
