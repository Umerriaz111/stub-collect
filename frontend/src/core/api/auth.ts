import { getApi } from "./apiService";


export const registerUserApi = async (registerData: any) => {
  const api = await getApi();
  return api.post("/auth/register", registerData);
};

export const loginApi = async (loginData: any) => {
  const api = await getApi();
  return api.post("/auth/login", loginData);
};

export const logoutApi = async () => {
  const api = await getApi();
  return api.post("/auth/logout");
};

export const checkAuthStatusApi = async () => {
  const api = await getApi();
  return api.get("/auth/userAuthStatusCheck");
};
