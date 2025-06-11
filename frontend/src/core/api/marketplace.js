import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const createListing = async (data) => {
  return await api.post("/api/marketplace/list", data);
};
