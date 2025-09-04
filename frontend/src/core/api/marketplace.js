import { getApi } from "./apiService";

export const createListing = async (data) => {
  const api = await getApi();
  return await api.post("/api/marketplace/list", data);
};

export const getAllListing = async (filters = {}) => {
  const api = await getApi();
  // Only include keys with non-empty values
  const params = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = value;
    }
  });
  return await api.get("/api/marketplace/listings", { params: Object.keys(params).length ? params : undefined });
};

export const getListingBySeller = async (sellerId) => {
  const api = await getApi();
  return await api.get(`/api/marketplace/sellers/${sellerId}/listings`);
};
