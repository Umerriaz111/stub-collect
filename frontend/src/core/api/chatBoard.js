import { getApi } from "./apiService";

export const askChatbot = async (formData) => {
  const api = await getApi();
  return await api.post("/api/chatbot/chat", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // required for file uploads
    },
  });
};
