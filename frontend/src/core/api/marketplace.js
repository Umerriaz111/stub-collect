import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const createListing = async (data) => {
  return await api.post("/api/marketplace/list", data);
};

export const getAllListing = async () => {
  return await api.get("/api/marketplace/listings");
};

export const getListingBySeller = async (sellerId) => {
  return await api.get(`/api/marketplace/sellers/${sellerId}/listings`);
};
