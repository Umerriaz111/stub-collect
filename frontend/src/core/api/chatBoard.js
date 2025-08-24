import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

export const askChatbot = async (formData) => {
  return await api.post("/api/chatbot/chat", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // required for file uploads
    },
  });
};
