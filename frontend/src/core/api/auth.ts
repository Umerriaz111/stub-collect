import ApiService from "../services/apiService";
import config from "../services/configService";
import axios from "axios";

export const registerUserApi = (registerData: any) => {
  return axios.post(
    `${config.VITE_APP_API_BASE_URL}/auth/register`,
    registerData
  );
};

// export const loginApi = async (loginData: any) => {
//     return axios.post(`${config.VITE_APP_AUTH_API_BASE_URL}/auth/login`, loginData)
// }

export const logoutApi = () => {
  return new Promise((resolve, reject) => {
    resolve({ status: "success", message: "logout successful" });
    reject({});
  });
};

export const loginApi = (loginData: any) => {
  return axios.post(`${config.VITE_APP_API_BASE_URL}/auth/login`, loginData, {
    withCredentials: true,
  });
};
