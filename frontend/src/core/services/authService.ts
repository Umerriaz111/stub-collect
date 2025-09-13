import { jwtDecode } from "jwt-decode";

const TOKEN = "token";
const USER = "user";
const PRINT_BY_APP = "printByApp";

const REFRESH_TOKEN = "refreshToken";

export type DecodedToken = {
  id: number;
  username: string;
  role: string;
  iat: number;
  exp: number;
};

export const saveRefreshToken = (refreshToken: string) => {
  window.localStorage.setItem(REFRESH_TOKEN, refreshToken);
};

export const getRefreshToken = () => {
  return window.localStorage.getItem(REFRESH_TOKEN);
};
export const destroyRefreshToken = () => {
  window.localStorage.removeItem(REFRESH_TOKEN);
};
export const getToken = () => {
  return window.localStorage.getItem(TOKEN);
};
export const saveToken = (token: string) => {
  window.localStorage.setItem(TOKEN, token);
};
export const savePrintingPreference = (pref: boolean) => {
  return window.localStorage.setItem(PRINT_BY_APP, JSON.stringify(pref));
};
export const getPrintingPreference = () => {
  const pref = window.localStorage.getItem(PRINT_BY_APP);
  return pref ? JSON.parse(pref) : false;
};

export const checkExpiry = (token: string | null): boolean => {
  if (!token) {
    return false;
  }

  try {
    const decodedToken = jwtDecode(token) as DecodedToken;

    // Validate token structure
    if (!decodedToken || typeof decodedToken.exp !== "number") {
      return false;
    }

    // Add buffer time (5 minutes) to prevent edge cases
    const bufferTime = 300; // 5 minutes in seconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Token is considered expired if it's within buffer time of expiry
    return decodedToken.exp > currentTime + bufferTime;
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return false;
  }
};

export const saveUser = (user: string) => {
  window.localStorage.setItem(USER, user);
};

export const getUser = () => {
  const user = window.localStorage.getItem(USER);
  return user ? user : null;
};

export const destroyToken = () => {
  window.localStorage.removeItem(TOKEN);
};

export default {
  getToken,
  saveToken,
  saveUser,
  getUser,
  destroyToken,
};
