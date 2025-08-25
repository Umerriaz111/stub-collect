import axios from "axios";
import config from "../services/configService";

const API_BASE_URL = config.VITE_APP_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
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
