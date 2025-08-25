import axios from "axios";
import config from "../services/configService";

const API_BASE_URL = config.VITE_APP_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const askChatbot = async (formData) => {
  return await api.post("/api/chatbot/chat", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // required for file uploads
    },
  });
};
