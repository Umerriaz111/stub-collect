import { getApi } from "./apiService";

export const createListing = async (data) => {
  const api = await getApi();
  return await api.post("/api/marketplace/list", data);
};

export const getAllListing = async () => {
  const api = await getApi();
  return await api.get("/api/marketplace/listings");
};

export const getListingBySeller = async (sellerId) => {
  const api = await getApi();
  return await api.get(`/api/marketplace/sellers/${sellerId}/listings`);
};
